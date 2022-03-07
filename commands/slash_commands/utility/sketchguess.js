const { ContextMenuInteraction, MessageEmbed, MessageAttachment } = require('discord.js');
const mongo = require('../../../mongo');
const { words } = require('../../../lists/sketch-words');
const { v4: uuidv4 } = require("uuid");
const { webkit } = require('playwright');
const sleep = require("timers/promises").setTimeout;
const sketchSchema = require('../../../schemas/sketch_guess/sketch_schema');
const path = require('path');

let fetchInProgress = false;
let previousEmbed;

module.exports = {
    name: `sketchguess`,
    description: `Command menu for the Sketch Guess game`,
    permission: ``,
    cooldown: 10,
    type: `CHAT_INPUT`,
    options: [{
        name: `draw`,
        description: `Elect yourself to draw`,
        type: `SUB_COMMAND`,
        usage: `/sketchguess draw`,
    },
    {
        name: `submit`,
        description: `Submit your drawing early`,
        type: `SUB_COMMAND`,
        usage: `/sketchguess submit`,
    },
    {
        name: `resend`,
        description: `Resend your drawing if there was an error`,
        type: `SUB_COMMAND`,
        usage: `/sketchguess resend`,
    },
    {
        name: `link`,
        description: `Resend your link incase you need it`,
        type: `SUB_COMMAND`,
        usage: `/sketchguess link`,
    },
    {
        name: `skip`,
        description: `Vote to skip the current drawing`,
        type: `SUB_COMMAND`,
        usage: `/sketchguess skip`,
    },
    {
        name: `end`,
        description: `End your turn`,
        type: `SUB_COMMAND`,
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

        await mongo().then(async () => {
            switch (options.getSubcommand()) {
                // initialize the game
                case 'draw': {
                    const results = await sketchSchema.find({});

                    // if there is no data about the game, we should add some
                    if (results.length === 0) {
                        await sketchSchema.findOneAndUpdate({}, {
                            currentWord: 'null',
                            currentDrawer: 'null',
                            previousDrawer: 'null',
                            urlId: 'null',
                            gameState: false,
                            voteSkip: 0,
                            hasVoted: [],
                            isSubmitted: false,
                            wasGuessed: false,
                            hasEnded: false
                        }, {
                            upsert: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                        initGame(user, interaction, channel);
                    } else {
                        await sketchSchema.findOneAndUpdate({}, {
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
                        initGame(user, interaction, channel);
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

                            // the canvas can take a few seconds to update for others so we compendate for this
                            await sleep(5000);

                            // fetch the drawing
                            fetchDrawing(channel, user, customId, randWord);

                        } else {
                            interaction.reply({
                                content: `You can't submit a drawing as you're not the current drawer`,
                                ephemeral: true
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                        }
                    }
                    break;
                }

                // allow the drawer to submit their drawing manually
                case 'resend': {
                    const results = await sketchSchema.find({})

                    for (const data of results) {
                        const currentDrawer = data.currentDrawer;
                        const customId = data.urlId;
                        const gameState = data.gameState;
                        const randWord = data.currentWord;
                        const wasGuessed = data.wasGuessed;

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

                            // the canvas can take a few seconds to update for others so we compensate for this
                            await sleep(5000);

                            if (wasGuessed) return;

                            const resending = true;

                            // fetch the drawing
                            fetchDrawing(channel, user, customId, randWord, resending);

                        } else {
                            interaction.reply({
                                content: `You can't submit a drawing as you're not the current drawer`,
                                ephemeral: true
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
                                content: `*Here is the link to you drawing!*
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
                            // we reached the amount of votes needed to skip the round - we can clear reset the entries
                            await sketchSchema.findOneAndUpdate({}, {
                                currentWord: 'null',
                                currentDrawer: 'null',
                                previousDrawer: currentDrawer,
                                urlId: 'null',
                                gameState: false,
                                voteSkip: 0,
                                hasVoted: [],
                                isSubmitted: false,
                                wasGuessed: false,
                                hasEnded: true
                            }, {
                                upsert: true
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                            const dgEmbed = new MessageEmbed()
                                .setAuthor({ name: `Game Over`, iconURL: 'https://cdn-icons-png.flaticon.com/512/1536/1536966.png' })
                                .setColor('#ff8a8a')
                                .setDescription(`We received 3 votes to skip the current round
The word was \`${currentWord.toUpperCase()}\``)
                                .setFooter({ text: `use '/sketchguess draw' to start a new round`, iconURL: 'https://cdn-icons-png.flaticon.com/512/1479/1479689.png' })

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

                            const dgEmbed = new MessageEmbed()
                                .setAuthor({ name: `Vote To Skip`, iconURL: 'https://cdn-icons-png.flaticon.com/512/1536/1536966.png' })
                                .setColor('#ff8a8a')
                                .setDescription(`There are currently \`${voteSkip}/3\` votes to skip the current round`)
                                .setFooter({ text: `use '/sketchguess voteskip' to vote`, iconURL: 'https://cdn-icons-png.flaticon.com/512/1479/1479689.png' })

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
                                currentDrawer: 'null',
                                previousDrawer: currentDrawer,
                                urlId: 'null',
                                gameState: false,
                                voteSkip: 0,
                                hasVoted: [],
                                isSubmitted: false,
                                wasGuessed: false,
                                hasEnded: true
                            }, {
                                upsert: true
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                            const dgEmbed = new MessageEmbed()
                                .setAuthor({ name: `Game Over`, iconURL: 'https://cdn-icons-png.flaticon.com/512/5553/5553850.png' })
                                .setColor('#ff8a8a')
                                .setDescription(`${user} has ended the round early`)
                                .setFooter({ text: `use '/sketchguess draw' to start a new round`, iconURL: 'https://cdn-icons-png.flaticon.com/512/1479/1479689.png' })

                            interaction.reply({
                                embeds: [dgEmbed]
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                            // set the channel permissions so that the drawer can send message
                            channel.permissionOverwrites.delete(currentDrawer).catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a channel's permissions: `, err));
                        } else if (member?.roles?.cache.has(process.env.STAFF_ROLE)) {
                            await sketchSchema.findOneAndUpdate({}, {
                                currentWord: 'null',
                                currentDrawer: 'null',
                                previousDrawer: currentDrawer,
                                urlId: 'null',
                                gameState: false,
                                voteSkip: 0,
                                hasVoted: [],
                                isSubmitted: false,
                                wasGuessed: false,
                                hasEnded: true
                            }, {
                                upsert: true
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                            const dgEmbed = new MessageEmbed()
                                .setAuthor({ name: `Game Over`, iconURL: 'https://cdn-icons-png.flaticon.com/512/5553/5553850.png' })
                                .setColor('#ff8a8a')
                                .setDescription(`A staff member has ended the round early`)
                                .setFooter({ text: `use '/sketchguess draw' to start a new round`, iconURL: 'https://cdn-icons-png.flaticon.com/512/1479/1479689.png' })

                            interaction.reply({
                                embeds: [dgEmbed]
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                            // set the channel permissions so that the drawer can send message
                            channel.permissionOverwrites.delete(currentDrawer).catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a channel's permissions: `, err));
                        } else {
                            interaction.reply({
                                content: `You can't end the turn as you're not the current drawer`,
                                ephemeral: true
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                        }
                    }
                }
            }
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));
    }
}

/**
 * INITIATE THE GAME
 */
async function initGame(user, interaction, channel) {
    await mongo().then(async () => {
        const customId = uuidv4().slice(0, Math.random() * (24 - 18) + 18); // unique room code can only be 24 chars long
        const canvasUrl = `https://aggie.io/${customId}`;
        const randNum = Math.floor(Math.random() * words.length);
        const randWord = words[randNum]; // pick a random word from the list

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

            // if there is not current game in progress
            if (!gameState) {
                await sketchSchema.findOneAndUpdate({}, {
                    currentWord: randWord,
                    currentDrawer: user?.id,
                    urlId: customId,
                    gameState: true,
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

                // sleep for 3 seconds before officially starting the round to allow the drawer time to load the webpage
                await sleep(3000);

                const results = await sketchSchema.find({});

                for (const data of results) {
                    const gameState = data.gameState;

                    if (gameState) {
                        if (user?.id === '325963234597142538') {
                            const dgEmbed = new MessageEmbed()
                            .setAuthor({ name: `New Round`, iconURL: 'https://cdn-icons-png.flaticon.com/512/3767/3767273.png' })
                            .setColor('#a2ff91')
                            .setDescription(`${user} has **6 minutes** to draw her word (because she's special)`)
                            .setImage('https://i.imgur.com/LA0Rzpk.jpg')
                            .setFooter({ text: `check back soon..`, iconURL: 'https://cdn-icons-png.flaticon.com/512/1479/1479689.png' })

                        channel?.send({
                            embeds: [dgEmbed]
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                        } else {
                            const dgEmbed = new MessageEmbed()
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
                }

                // sleep for 3 minutes and then fetch the drawing
                if (user?.id === '325963234597142538') await sleep(360000);
                await sleep(180000);

                const results2 = await sketchSchema.find({});

                for (const data of results2) {
                    const wasGuessed = data.wasGuessed;
                    const hasEnded = data.hasEnded;
                    const isSubmitted = data.isSubmitted;

                    // if the drawing was manually submitted, guessed or if the round has ended, we can stop here
                    if (wasGuessed || hasEnded || isSubmitted || fetchInProgress) return;

                    fetchDrawing(channel, user, customId, randWord);
                }
            }
        }
    }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));
}

/**
 * FETCH THE DRAWING
 */
async function fetchDrawing(channel, user, customId, randWord, resending) {
    // if the drawing is in the process of being fetched, we should stop here
    if (fetchInProgress) return;
    fetchInProgress = true;

    // fetch the drawing from the website
    let websiteUrl = `https://aggie.io/${customId}`;
    const browser = await webkit.launch();
    const page = await browser.newPage();

    // set our viewport
    await page.setViewportSize({
        width: 1920,
        height: 1080
    });

    // go to the website
    await page.goto(websiteUrl);

    // wait for the canvas to load
    await page.waitForSelector('div[class="editor-canvas"]', {
        hidden: false
    });

    // if the page is stuck on 'loading', restart the function
    const divLoading = await page.locator('div[class="editor-long-task"]').count();
    if (divLoading === 1) {
        fetchInProgress = false;

        await browser.close();

        return fetchDrawing(channel, user, customId, randWord);
    }

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

        await mongo().then(async () => {
            // transform our word into underscores
            const prehint = randWord.replace(/\S/g, '\\_ ');
            const hint = prehint.replace(/\s/g, '⠀');

            const dgEmbed = new MessageEmbed()
                .setAuthor({ name: `${user?.tag}'s drawing`, iconURL: 'https://cdn-icons-png.flaticon.com/512/4229/4229137.png' })
                .setColor('#fff47a')
                .addField(`Hint *(${randWord.length} letters)*`, `${hint}`, true)
                .setFooter({
                    text: `• /sketchguess skip - vote to skip the current drawing
• /sketchguess resend - fix a broken drawing`, iconURL: 'https://cdn-icons-png.flaticon.com/512/1479/1479689.png'
                })

            // sometimes images aren't being attached to embed properly - hoping this solves that?
            await sleep(1000);

            const results = await sketchSchema.find({});

            for (const data of results) {
                const wasGuessed = data.wasGuessed;

                if (wasGuessed) return;

                // if the resend command was ran, we edit the old embed with the new image
                if (resending) {
                    await channel.messages.fetch(previousEmbed).then(fetched => {
                        const embed = fetched?.embeds[0];

                        if (!embed) return;

                        const attachment = new MessageAttachment(image, "sketch.jpg");

                        embed.setImage('attachment://sketch.jpg');

                        fetched.edit({ embeds: [embed], files: [attachment] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an embed: `, err));
                    });
                    return;
                }

                const attachment = new MessageAttachment(image, "sketch.jpg");

                dgEmbed.setImage('attachment://sketch.jpg')

                await channel?.send({
                    embeds: [dgEmbed],
                    files: [attachment]
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err))
                    .then(async m => {
                        previousEmbed = m.id;
                    });
            }

            // update the database so we know the screenshot has already been submitted
            await sketchSchema.findOneAndUpdate({}, {
                isSubmitted: true
            }, {
                upsert: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

            // when X amount of guesses have been sent, the initial embed will be pushed off screen so we should send it again
            const collector = channel.createMessageCollector();
            let count = 0;

            collector.on('collect', async () => {
                await sleep(1000)

                const results = await sketchSchema.find({});

                for (const data of results) {
                    const wasGuessed = data.wasGuessed;
                    const hasEnded = data.hasEnded;

                    if (wasGuessed || hasEnded) return collector.stop();

                    count++;

                    if (count >= 12) {
                        count = 0;

                        channel?.send({
                            embeds: [dgEmbed]
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));
                    }
                }
            });
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));

        // the drawing has been fetching process is complete, we can reset this
        fetchInProgress = false;
    });
}