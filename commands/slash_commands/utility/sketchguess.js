const { ContextMenuInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const mongo = require('../../../mongo');
const { countries } = require('../../../lists/sketchguess_words/countries');
const { objects } = require('../../../lists/sketchguess_words/objects');
const { pokemon } = require('../../../lists/sketchguess_words/pokemon');
const { v4: uuidv4 } = require("uuid");
const { webkit } = require('playwright');
const sleep = require("timers/promises").setTimeout;
const sketchSchema = require('../../../schemas/sketch_guess/sketch_schema');
const path = require('path');

let fetchInProgress = false;
let resending = false;
let categoryChoice;

module.exports = {
    name: `sketchguess`,
    description: `Command menu for the Sketch Guess game`,
    cooldown: 10,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `draw`,
        description: `Elect yourself to draw`,
        type: ApplicationCommandOptionType.Subcommand,
        usage: `/sketchguess draw [category]`,
        options: [{
            name: `category`,
            description: `Pick a category to draw a word from`,
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [{ name: 'Objects (easy - medium)', value: 'objects' }, { name: 'Pokemon (easy - medium)', value: 'pokemon' }, { name: 'Countries (medium - hard)', value: 'countries' }]
        }]
    },
    {
        name: `submit`,
        description: `Submit your drawing early`,
        type: ApplicationCommandOptionType.Subcommand,
        usage: `/sketchguess submit`,
    },
    {
        name: `resend`,
        description: `Resend your drawing if there was an error`,
        type: ApplicationCommandOptionType.Subcommand,
        usage: `/sketchguess resend`,
    },
    {
        name: `link`,
        description: `Resend your link incase you need it`,
        type: ApplicationCommandOptionType.Subcommand,
        usage: `/sketchguess link`,
    },
    {
        name: `hint`,
        description: `Get a hint for the current word`,
        type: ApplicationCommandOptionType.Subcommand,
        usage: `/sketchguess hint`,
    },
    {
        name: `skip`,
        description: `Vote to skip the current drawing`,
        type: ApplicationCommandOptionType.Subcommand,
        usage: `/sketchguess skip`,
    },
    {
        name: `end`,
        description: `End your turn`,
        type: ApplicationCommandOptionType.Subcommand,
        usage: `/sketchguess end`,
    }],
    /**
     *
     * @param {ContextMenuInteraction} interaction
     */
    async execute(interaction) {
        const { channel, user, member, options } = interaction;

        // only allow the command to be ran in the Sketch Guess channel
        if (channel?.id !== process.env.SKETCH_CHAN) {
            return interaction.reply({
                content: `You can only use this command in the <#${process.env.SKETCH_CHAN}> channel`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem : `, err));
        }

        switch (options.getSubcommand()) {
            // initialize the game
            case 'draw': {
                const results = await sketchSchema.find({});

                // if there is no data about the game, we should add some
                if (results.length === 0) {
                    await sketchSchema.findOneAndUpdate({}, {
                        currentWord: 'null',
                        category: 'null',
                        currentDrawer: 'null',
                        previousDrawer: 'null',
                        urlId: 'null',
                        gameState: false,
                        hintsLeft: 2,
                        usedLetters: [],
                        sentHints: [],
                        voteSkip: 0,
                        hasVoted: [],
                        isSubmitted: false,
                        wasGuessed: false,
                        hasEnded: false
                    }, {
                        upsert: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                    initGame(user, interaction, channel, options);
                } else {
                    await sketchSchema.findOneAndUpdate({}, {
                        category: 'null',
                        hintsLeft: 2,
                        usedLetters: [],
                        sentHints: [],
                        voteSkip: 0,
                        hasVoted: [],
                        isSubmitted: false,
                        wasGuessed: false,
                        hasEnded: false
                    }, {
                        upsert: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                    // disallow a user to draw 2 times in a row - though staff are allowed to do this
                    if (!member?.roles?.cache.has(process.env.STAFF_ROLE)) {
                        for (const data of results) {
                            if (user.id === data.previousDrawer) {
                                return interaction.reply({
                                    content: `You can't draw 2 times in a row. Wait for someone else to draw before trying again`,
                                    ephemeral: true
                                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                            }
                        }
                    }

                    initGame(user, interaction, channel, options);
                }
                break;
            }

            // allow the drawer to submit their drawing manually
            case 'submit': {
                const results = await sketchSchema.find({})

                for (const data of results) {
                    const currentDrawer = data.currentDrawer;
                    const customId = data.urlId;
                    const gameState = data.gameState;
                    const randWord = data.currentWord;
                    const isSubmitted = data.isSubmitted;
                    const category = data.category;

                    // if there is no current active game
                    if (!gameState) {
                        return interaction.reply({
                            content: `There is no active game currently. Start a new game with \`/skecthguess draw\``,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    }

                    // only allow the current drawer to submit their drawing
                    if (user?.id === currentDrawer || member?.roles?.cache.has(process.env.STAFF_ROLE)) {
                        // if the drawing has already been submitted
                        if (isSubmitted && !member?.roles?.cache.has(process.env.STAFF_ROLE)) {
                            return interaction.reply({
                                content: `Your drawing has already been submitted
If there was an error with the first embed, use \`/sketchguess resend\``,
                                ephemeral: true
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                        }

                        // if the drawing is in the process of being fetched
                        if (fetchInProgress) {
                            return interaction.reply({
                                content: `Your drawing is already being fetched and should appear soon`,
                                ephemeral: true
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                        }

                        interaction.reply({
                            content: `Your drawing has been sumbitted and will appear soon, this may take a few second..`,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                        resending = false;

                        // fetch the drawing
                        fetchDrawing(channel, user, customId, randWord, category);

                    } else {
                        interaction.reply({
                            content: `You can't submit a drawing as you're not the current drawer`,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    }
                }
                break;
            }

            // allow the drawer to resend their drawing in case it was broken or missing
            case 'resend': {
                const results = await sketchSchema.find({})

                for (const data of results) {
                    const currentDrawer = data.currentDrawer;
                    const customId = data.urlId;
                    const gameState = data.gameState;
                    const randWord = data.currentWord;
                    const wasGuessed = data.wasGuessed;
                    const category = data.category;

                    // if there is no current active game
                    if (!gameState) {
                        return interaction.reply({
                            content: `There is no active game currently. Start a new game with \`/skecthguess draw\``,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    }

                    // only allow the current drawer to submit their drawing
                    if (user?.id === currentDrawer || member?.roles?.cache.has(process.env.STAFF_ROLE)) {
                        // if the drawing is in the process of being fetched
                        if (fetchInProgress) {
                            return interaction.reply({
                                content: `Your drawing is already being fetched and should appear soon`,
                                ephemeral: true
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                        }

                        interaction.reply({
                            content: `Resending your drawing. The current image will be replaced with the new one`,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                        if (wasGuessed) return;

                        resending = true;

                        // fetch the drawing
                        fetchDrawing(channel, user, customId, randWord, category);

                    } else {
                        interaction.reply({
                            content: `You can't submit a drawing as you're not the current drawer`,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    }
                }
                break;
            }

            // allow players to receive 2 hints per round
            case 'hint': {
                const results = await sketchSchema.find({});

                for (const data of results) {
                    const currentDrawer = data.currentDrawer;
                    const gameState = data.gameState;
                    const currentWord = data.currentWord;
                    const usedLetters = data.usedLetters;
                    const sentHints = data.sentHints;
                    const isSubmitted = data.isSubmitted;
                    let hintsLeft = data.hintsLeft;

                    // if there is no current active game
                    if (!gameState) {
                        return interaction.reply({
                            content: `There is no active game currently. Start a new game with \`/skecthguess draw\``,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    }

                    // users need to wait until the drawing has been submitted before they can request a hint
                    if (!isSubmitted) {
                        return interaction.reply({
                            content: `Please wait until you see the drawing before requesting a hint`,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    }

                    // if no hints remaining
                    if (hintsLeft === 0) {
                        return interaction.reply({
                            content: `All hints have been used for this round`,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    }

                    // if the user is the current drawer, we don't allow them to get hints
                    if (user?.id === currentDrawer) {
                        return interaction.reply({
                            content: `You can't request a hint as you're the current drawer`,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    }

                    const word = currentWord;
                    const str = word.split('').join(' ');

                    // pick a random letter from the word
                    function randLetter(str) {
                        const rand = str[Math.floor(Math.random() * str.length)];

                        // if the letter has already been used for a hint, we will try a different letter
                        if (usedLetters.includes(rand)) return randLetter(str);

                        return rand;
                    }
                    let rand = randLetter(str);

                    // if rand is a whitespace
                    while (rand === ' ') {
                        rand = randLetter(str);
                    }

                    // add the random letter to our array so we don't use it again
                    usedLetters.push(rand);

                    // count the occurences of the random letter in the word - we need a number between 0 and the number of occurences
                    const strLength = str.split(rand).length;
                    let randNum = Math.floor(Math.random() * strLength);
                    if (randNum != 0) randNum -= 1;

                    // replace the randNum occurence of the random letter with '.'
                    const regex = new RegExp(`((?:.*?${rand}.*?){${randNum}})${rand}`);
                    const prehint = str.replace(regex, '$1.');

                    // replaces all chars except '.' with '_'
                    const regex2 = new RegExp(`(?![.])\\S`, 'g');
                    const prehint2 = prehint.replace(regex2, '\\_');

                    // replace '.' with 'rand'
                    const regex3 = new RegExp(`\\.`, 'g');
                    const hint = prehint2.replace(regex3, rand);

                    // add the hint to an array in case we need to merge it with a new hint later
                    sentHints.push(hint);

                    // if we've already sent a hint, merge the new and old hint together
                    if (hintsLeft <= 1) {
                        hintsLeft -= 1;

                        const hint1 = sentHints[0];
                        const hint2 = sentHints[1];

                        let newHint;

                        let hints = [];

                        const regex = /[a-z]/;
                        const str1Index = hint1.match(regex).index + 1
                        const str2Index = hint2.match(regex).index + 1

                        // we need to push the hints to a new array in order of which hint has a letter visible first
                        if (str1Index < str2Index) {
                            hints.push(hint1)
                            hints.push(hint2)
                        } else {
                            hints.push(hint2)
                            hints.push(hint1)
                        }

                        // merge the two hints so the we overwrite any changes between them
                        for (let i = 0; i < hints[0].length; i++) {
                            if (hints[0].charAt(i) != hints[1].charAt(i)) {

                                newHint = setCharAt(hints[0], i, hints[1].charAt(i))

                                function setCharAt(str, pos, char) {
                                    if (pos > str.length - 1) return str;
                                    return str.substring(0, pos) + char + str.substring(pos + 1);
                                }
                            }
                        }

                        const hintPost = newHint.replace(/\\/g, '');
                        const hintFinal = hintPost.replace(/_/g, '\\_');

                        const hintEmbed = new EmbedBuilder()
                            .setAuthor({ name: `Hint Used`, iconURL: 'https://cdn-icons-png.flaticon.com/512/1378/1378629.png' })
                            .setColor('#a6e7ff')
                            .addFields({ name: `Hint *(${currentWord.length} letters)*`, value: `${hintFinal}`, inline: false })
                            .setFooter({
                                text: `hints remaining: ${hintsLeft}
/sketchguess skip - vote to skip`, iconURL: 'https://cdn-icons-png.flaticon.com/512/1479/1479689.png'
                            })

                        await sketchSchema.findOneAndUpdate({}, {
                            hintsLeft: hintsLeft,
                            usedLetters: usedLetters,
                            sentHints: sentHints
                        }, {
                            upsert: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                        interaction.reply({
                            embeds: [hintEmbed]
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                    } else {
                        hintsLeft -= 1;

                        const hintEmbed = new EmbedBuilder()
                            .setAuthor({ name: `Hint Used`, iconURL: 'https://cdn-icons-png.flaticon.com/512/1378/1378629.png' })
                            .setColor('#a6e7ff')
                            .addFields({ name: `Hint *(${currentWord.length} letters)*`, value: `${hint}`, inline: false })
                            .setFooter({
                                text: `hints remaining: ${hintsLeft}
/sketchguess hint - for another hint`, iconURL: 'https://cdn-icons-png.flaticon.com/512/1479/1479689.png'
                            })

                        await sketchSchema.findOneAndUpdate({}, {
                            hintsLeft: hintsLeft,
                            usedLetters: usedLetters,
                            sentHints: sentHints
                        }, {
                            upsert: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                        interaction.reply({
                            embeds: [hintEmbed]
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    }
                }
                break;
            }

            // allow the drawer request their link again - incase they closed the initial reply too early
            case 'link': {
                const results = await sketchSchema.find({});

                for (const data of results) {
                    const currentDrawer = data.currentDrawer;
                    const customId = data.urlId;
                    const gameState = data.gameState;
                    const canvasUrl = `https://aggie.io/${customId}`;

                    // if there is no current active game
                    if (!gameState) {
                        return interaction.reply({
                            content: `There is no active game currently. Start a new game with \`/skecthguess draw\``,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    }

                    // only allow the current drawer to retrieve the link
                    if (user?.id === currentDrawer) {
                        interaction.reply({
                            content: `*Here is the link to your drawing!*
> [Click here to start drawing!](<${canvasUrl}>)`,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                    } else {
                        interaction.reply({
                            content: `You can't see the current link as you're not the current drawer`,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    }
                }
                break;
            }


            // allow users to vote to skip the current round - we can skip with 3 unique votes
            case 'skip': {
                const results = await sketchSchema.find({});

                for (const data of results) {
                    const hasVoted = data.hasVoted;
                    const currentDrawer = data.currentDrawer;
                    const gameState = data.gameState;
                    const currentWord = data.currentWord;

                    // if there is no current active game
                    if (!gameState) {
                        return interaction.reply({
                            content: `There is no active game currently. Start a new game with \`/skecthguess draw\``,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    }

                    // disallow a user to vote more than once
                    if (hasVoted.includes(user?.id)) {
                        return interaction.reply({
                            content: `You have already voted to skip this round. You can only vote to skip once per round`
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                    }

                    //add the voter to the array
                    hasVoted.push(user?.id);

                    // increment the voteSkip count and see how many votes we have
                    let voteSkip = data.voteSkip;
                    voteSkip++;

                    if (voteSkip >= 3) {
                        resending = false;

                        // we reached the amount of votes needed to skip the round - we can clear reset the entries
                        await sketchSchema.findOneAndUpdate({}, {
                            currentWord: 'null',
                            category: 'null',
                            currentDrawer: 'null',
                            previousDrawer: currentDrawer,
                            urlId: 'null',
                            gameState: false,
                            hintsLeft: 2,
                            usedLetters: [],
                            sentHints: [],
                            voteSkip: 0,
                            hasVoted: [],
                            isSubmitted: false,
                            wasGuessed: false,
                            hasEnded: true
                        }, {
                            upsert: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                        const dgEmbed = new EmbedBuilder()
                            .setAuthor({ name: `Game Over`, iconURL: 'https://cdn-icons-png.flaticon.com/512/1536/1536966.png' })
                            .setColor('#ff8a8a')
                            .setDescription(`We received 3 votes to skip the current round
The word was \`${currentWord.toUpperCase()}\``)
                            .setFooter({ text: `/sketchguess draw - start a new round`, iconURL: 'https://cdn-icons-png.flaticon.com/512/1479/1479689.png' })

                        interaction.reply({
                            embeds: [dgEmbed]
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

                    } else {
                        // update the database with the current votes and user IDs
                        await sketchSchema.findOneAndUpdate({}, {
                            voteSkip: voteSkip,
                            hasVoted: hasVoted,
                        }, {
                            upsert: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                        const dgEmbed = new EmbedBuilder()
                            .setAuthor({ name: `Vote To Skip`, iconURL: 'https://cdn-icons-png.flaticon.com/512/1536/1536966.png' })
                            .setColor('#ff8a8a')
                            .setDescription(`There are currently \`${voteSkip}/3\` votes to skip the current round`)
                            .setFooter({ text: `/sketchguess skip - vote to skip`, iconURL: 'https://cdn-icons-png.flaticon.com/512/1479/1479689.png' })

                        interaction.reply({
                            embeds: [dgEmbed]
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                    }
                }
                break;
            }

            // allow a user to end their turn early for whatever reason
            case 'end': {
                const results = await sketchSchema.find({})

                for (const data of results) {
                    const currentDrawer = data.currentDrawer;
                    const gameState = data.gameState;

                    // if there is no current active game
                    if (!gameState) {
                        return interaction.reply({
                            content: `There is no active game currently. Start a new game with \`/skecthguess draw\``,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    }

                    // only allow the current drawer or a staff member to end the turn early
                    if (user?.id === currentDrawer) {
                        await sketchSchema.findOneAndUpdate({}, {
                            currentWord: 'null',
                            category: 'null',
                            currentDrawer: 'null',
                            previousDrawer: currentDrawer,
                            urlId: 'null',
                            gameState: false,
                            hintsLeft: 2,
                            usedLetters: [],
                            sentHints: [],
                            voteSkip: 0,
                            hasVoted: [],
                            isSubmitted: false,
                            wasGuessed: false,
                            hasEnded: true
                        }, {
                            upsert: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                        resending = false;

                        const dgEmbed = new EmbedBuilder()
                            .setAuthor({ name: `Game Over`, iconURL: 'https://cdn-icons-png.flaticon.com/512/5553/5553850.png' })
                            .setColor('#ff8a8a')
                            .setDescription(`${user} has ended the round early`)
                            .setFooter({ text: `/sketchguess draw - start a new round`, iconURL: 'https://cdn-icons-png.flaticon.com/512/1479/1479689.png' })

                        interaction.reply({
                            embeds: [dgEmbed]
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    } else if (member?.roles?.cache.has(process.env.STAFF_ROLE)) {
                        await sketchSchema.findOneAndUpdate({}, {
                            currentWord: 'null',
                            category: 'null',
                            currentDrawer: 'null',
                            previousDrawer: currentDrawer,
                            urlId: 'null',
                            gameState: false,
                            hintsLeft: 2,
                            usedLetters: [],
                            sentHints: [],
                            voteSkip: 0,
                            hasVoted: [],
                            isSubmitted: false,
                            wasGuessed: false,
                            hasEnded: true
                        }, {
                            upsert: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                        const dgEmbed = new EmbedBuilder()
                            .setAuthor({ name: `Game Over`, iconURL: 'https://cdn-icons-png.flaticon.com/512/5553/5553850.png' })
                            .setColor('#ff8a8a')
                            .setDescription(`A staff member has ended the round early`)
                            .setFooter({ text: `/sketchguess draw - start a new round`, iconURL: 'https://cdn-icons-png.flaticon.com/512/1479/1479689.png' })

                        interaction.reply({
                            embeds: [dgEmbed]
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    } else {
                        interaction.reply({
                            content: `You can't end the turn as you're not the current drawer`,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    }
                }
            }
        }
    }
}

/**
 * INITIATE THE GAME
 */
async function initGame(user, interaction, channel, options) {
    categoryChoice = options.getString('category');
    const category = eval(categoryChoice);
    const customId = uuidv4().slice(0, Math.random() * (24 - 18) + 18); // unique room code can only be 24 chars long
    const canvasUrl = `https://aggie.io/${customId}`;
    const randNum = Math.floor(Math.random() * category.length); // random number
    const randWord = category[randNum]; // pick a random word from the list

    const results = await sketchSchema.find({});

    for (const data of results) {
        const gameState = data.gameState;

        // check the current game state to see if there is a game currently in progress or not
        // if there is a current game in progress
        if (gameState) {
            return interaction.reply({
                content: `There is currently a game of Sketch Guess in progress, join in <#${process.env.SKETCH_CHAN}>, or wait for the round to end`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }

        // if there is no current game in progress
        if (!gameState) {

            resending = false;

            await sketchSchema.findOneAndUpdate({}, {
                currentWord: randWord,
                category: categoryChoice,
                currentDrawer: user?.id,
                urlId: customId,
                gameState: true,
                hintsLeft: 2,
                usedLetters: [],
                sentHints: [],
                voteSkip: 0,
                hasVoted: [],
                isSubmitted: false,
                hasEnded: false,
                wasGuess: false
            }, {
                upsert: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

            if (user?.id === '325963234597142538') {
                interaction.reply({
                    content: `*It's your turn to draw!*
> ✏️ **You has 6 minutes to draw the word (because you're special) \`${randWord.toUpperCase()}\`**
> [Click here to start drawing!](<${canvasUrl}>)

*Do not dismiss this message until you have opened the link above*
*You can end your turn early with \`/sketchguess end\`*
*If you drawing fails to send, or has another issue, user \`/sketchguess resend\`*`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
            } else {
                interaction.reply({
                    content: `*It's your turn to draw!*
> ✏️ **You have 3 minutes to draw the word \`${randWord.toUpperCase()}\`**
> [Click here to start drawing!](<${canvasUrl}>)

*Do not dismiss this message until you have opened the link above*
*You can end your turn early with \`/sketchguess end\`*
*If you drawing fails to send, or has another issue, user \`/sketchguess resend\`*`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
            }

            // sleep for 10 seconds before officially starting the round to allow the drawer time to load the webpage
            await sleep(10000);

            const results = await sketchSchema.find({});

            for (const data of results) {
                const gameState = data.gameState;

                if (gameState) {
                    const dgEmbed = new EmbedBuilder()
                        .setAuthor({ name: `New Round`, iconURL: 'https://cdn-icons-png.flaticon.com/512/3767/3767273.png' })
                        .setColor('#a2ff91')
                        .setDescription(`${user} has **3 minutes** to draw their word`)
                        .setImage('https://i.imgur.com/LA0Rzpk.jpg')
                        .setFooter({ text: `check back soon..`, iconURL: 'https://cdn-icons-png.flaticon.com/512/1479/1479689.png' })

                    channel?.send({
                        embeds: [dgEmbed]
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                }
            }

            // sleep for 3 minutes and then fetch the drawing
            await sleep(150000);

            const results2 = await sketchSchema.find({});

            for (const data of results2) {
                const wasGuessed = data.wasGuessed;
                const hasEnded = data.hasEnded;
                const isSubmitted = data.isSubmitted;
                const category = data.category;
                const custId = data.urlId;

                // if the drawing was manually submitted, guessed or if the round has ended, we can stop here
                if (wasGuessed || hasEnded || isSubmitted || fetchInProgress) return;
                fetchDrawing(channel, user, custId, randWord, category);
            }
        }
    }
}

/**
 * FETCH THE DRAWING
 */
async function fetchDrawing(channel, user, customId, randWord, categoryChoice) {
    // if the drawing is in the process of being fetched, we should stop here
    if (fetchInProgress) return;
    fetchInProgress = true;

    // fetch the drawing from the website
    let websiteUrl = `https://aggie.io/${customId}`;

    const browser = await webkit.launch();
    // Load page once and then refresh it
    await loadPage(channel, user, customId, websiteUrl, randWord, categoryChoice, browser);
    await sleep(10000);
    const page = await loadPage(channel, user, customId, websiteUrl, randWord, categoryChoice, browser);

    // take a screenshot of the page and crop what we don't need
    await page.screenshot({
        clip: {
            x: 90, // top
            y: 130, // left
            width: 1530,
            height: 865
        }
    }).then(async image => {
        // close browser and cleanup
        await browser.close();

        const attachment = new AttachmentBuilder(image, { name: "sketch.jpg" });

        // transform our word into underscores
        const prehint = randWord.replace(/\S/g, '\\_ ');
        const hint = prehint.replace(/\s/g, '⠀');

        const dgEmbed = new EmbedBuilder()
            .setAuthor({ name: `${user?.tag}'s drawing`, iconURL: 'https://cdn-icons-png.flaticon.com/512/4229/4229137.png' })
            .setColor('#fff47a')
            .addFields({ name: `Category`, value: `${categoryChoice.charAt(0).toUpperCase() + categoryChoice.slice(1)}`, inline: true },
                { name: `Hint *(${randWord.length} letters)*`, value: `${hint}`, inline: true })
            .setFooter({
                text: `/sketchguess hint - get a hint
/sketchguess resend - fix broken drawing`, iconURL: 'https://cdn-icons-png.flaticon.com/512/1479/1479689.png'
            })

        // sometimes images aren't being attached to embed properly - hoping this solves that?
        await sleep(1000);

        const results = await sketchSchema.find({});

        for (const data of results) {
            const wasGuessed = data.wasGuessed;
            const previousEmbed = data.previousEmbed

            if (wasGuessed) return;

            // if the resend command was ran, we edit the old embed with the new image
            if (resending) {
                await channel.messages.fetch(previousEmbed).then(fetched => {
                    const embed = fetched?.embeds[0].data;

                    const update = new EmbedBuilder(embed)

                    const attachment = new AttachmentBuilder(image, { name: "sketch.jpg" });

                    update.setImage('attachment://sketch.jpg')

                    fetched.edit({ embeds: [update], files: [attachment] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an embed: `, err));
                    fetchInProgress = false;
                });

                resending = false;
                return;
            }

            dgEmbed.setImage('attachment://sketch.jpg')

            await channel?.send({
                embeds: [dgEmbed],
                files: [attachment]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err))
                .then(async m => {
                    await sketchSchema.findOneAndUpdate({}, {
                        previousEmbed: m.id
                    }, {
                        upsert: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
                });
        }

        // update the database so we know the screenshot has already been submitted
        await sketchSchema.findOneAndUpdate({}, {
            isSubmitted: true
        }, {
            upsert: true
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

        // the drawing has been fetching process is complete, we can reset this
        fetchInProgress = false;
    });
}

async function loadPage(channel, user, customId, websiteUrl, randWord, categoryChoice, browser) {
    const page = await browser.newPage();

    // set our viewport
    await page.setViewportSize({
        width: 1920,
        height: 1080
    });

    // go to the website
    await page.goto(websiteUrl);

    // wait for the canvas to load
    await page.waitForSelector('canvas[class="checker layer-thumb"]');

    // if the page is stuck on 'loading', restart the function
    // const divLoading = await page.locator('div[class="editor-long-task"]').count();
    // if (divLoading === 1) {
    //     fetchInProgress = false;

    //     await browser.close();

    //     return fetchDrawing(channel, user, customId, randWord, categoryChoice);
    // }

    // center and resize the canvas so we can see it all
    await page.locator('button[command="zoom-out"]').click();
    await sleep(300);
    await page.locator('button[command="fit-on-screen"]').click();
    await sleep(1000);

    // remove tooltips that obstruct the canvas
    let selector = '.tooltip';
    await page.evaluate((s) => {
        var elements = document.querySelectorAll(s);

        for (var i = 0; i < elements.length; i++) {
            elements[i].parentNode.removeChild(elements[i]);
        }
    }, selector);

    return page;
}