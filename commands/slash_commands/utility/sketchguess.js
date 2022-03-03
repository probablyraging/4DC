const {ContextMenuInteraction, MessageEmbed} = require('discord.js');
const mongo = require('../../../mongo');
const {words} = require('../../../lists/sketch-words');
const {v4: uuidv4} = require("uuid");
const webshot = require('node-webshot');
const {ImgurClient} = require('imgur');
const fs = require('fs');
const sleep = require("timers/promises").setTimeout;
const path = require('path');
const sketchSchema = require('../../../schemas/sketch_guess/sketch_schema');

async function initGame(user, interaction, channel) {
    await mongo().then(async () => {
        const customId = uuidv4();
        const canvasUrl = `https://wbo.ophir.dev/boards/${user.username}${customId}#0,0,0.85`;
        const randNum = Math.floor(Math.random() * words.length);
        const randWord = words[randNum];
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
                    hasEnded: false
                }, {
                    upsert: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                interaction.reply({
                    content: `*It's your turn to draw!*
> ✏️ **You have 60 seconds to draw the word \`${randWord.toUpperCase()}\`**
> [Click here to start drawing!](<${canvasUrl}>)

*Do not dismiss this message until you have opened the link above*
*You can end your turn early with \`/sketchguess end\`*`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                // set the channel permissions so that the drawer can't send messages
                channel.permissionOverwrites.edit(user?.id, {
                    SEND_MESSAGES: false
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err));
            }

            // sleep for 3 seconds to allow the user time to load the webpage
            await sleep(3000)

            const results = await sketchSchema.find({})

            for (const data of results) {
                const gameState = data.gameState;

                if (gameState) {
                    const getReady = await channel?.send({
                        content: `✏️ ${user} has started drawing!
> They have 60 seconds to draw their word. Check back soon to guess their drawing`,
                        allowedMentions: {
                            parse: []
                        }
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));


                    // sleep for 60 seconds and then fetch the drawing
                    await sleep(60000);

                    const fetch = await channel?.messages?.fetch(getReady?.id).catch(err => console.error(`${path.basename(__filename)} There was a problem fetching a message: `, err));
                    fetch.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                }
            }

            fetchDrawing(channel, user, customId, randWord);
        }
    }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));
}

// fetch the current drawing
async function fetchDrawing(channel, user, customId, randWord) {
    console.log("Fetching drawing.");
    const options = {
        renderDelay: 6000,

        defaultWhiteBackground: true,

        screenSize: {
            width: 2160,
            height: 1080
        },

        shotSize: {
            width: 2160,
            height: 1080
        },

        shotOffset: {
            left: 60,
        }
    };

    // fetch the drawing and save it locally
    let webshotUrl = `https://wbo.ophir.dev/boards/${user.username}${customId}`;
    let jpgFilename = `${user.username}${customId}.jpg`;
    webshot(webshotUrl, jpgFilename, options, function (err) {
        if (err) {
            console.error(`Error while using webshot. Url: '${webshotUrl}', Filename: '${jpgFilename}'`, err);
        } else {
            console.log("Webshot successful. Uploading drawing.");
            uploadDrawing(channel, user, customId, randWord);
        }
    });
}

// upload the drawing to the Sketch Guess channel
async function uploadDrawing(channel, user, customId, randWord) {
    // sleep for 5 second to give the image time to be saved locally
    console.log("Waiting for drawing to save locally.");
    await sleep(5000);
    console.log("Drawing should be saved locally. Starting guessing phase.");

    await mongo().then(async () => {
        const results = await sketchSchema.find({})

        for (const data of results) {
            const wasGuessed = data.wasGuessed;
            const hasEnded = data.hasEnded;

            let hint = ``;
            for (let i = 0; i < randWord.length; i++) {
                hint += '\\_ '
            }

            const dgEmbed = new MessageEmbed()
                .setAuthor({name: `${user?.tag}'s drawing`, iconURL: 'https://cdn-icons-png.flaticon.com/512/4229/4229137.png'})
                .setColor('#fff47a')
                .addField(`Category`, `Object`, true)
                .addField(`Hint`, `${hint}`, true)
                .setFooter({text: `you have 1 minute to guess the drawing`, iconURL: 'https://cdn-icons-png.flaticon.com/512/1479/1479689.png'})


            // upload the local drawing file to IMGUR and then upload it to the Sketch Guess channel
            const imgur = new ImgurClient({clientId: process.env.IMGUR_ID, clientSecret: process.env.IMGUR_SECRET});

            const response = await imgur.upload({
                image: fs.createReadStream(`./${user?.username}${customId}.jpg`),
                type: 'stream',
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem uploading an image to imgur: `, err));

            let imgurUrl;
            response.forEach(res => {
                imgurUrl = res.data.link
                dgEmbed.setImage(imgurUrl);
            });

            // delete the local drawing file when we are finished with it
            fs.unlink(`./${user?.username}${customId}.jpg`, function (err) {
                if (err) return;
            });

            // if the drawing was guessed or if the round has ended, we can stop here
            if (wasGuessed || hasEnded) return;

            channel?.send({
                embeds: [dgEmbed]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));

            // wait for 40 seconds and then resend the image
            await sleep(40000)

            const results = await sketchSchema.find({})

            for (const data of results) {
                const wasGuessed = data.wasGuessed;
                const hasEnded = data.hasEnded;

                // if the drawing was guessed or if the round has ended, we can stop here
                if (wasGuessed || hasEnded) return;

                let hint = ``;
                for (let i = 0; i < randWord.length; i++) {
                    hint += '\\_ '
                }

                const dgEmbed = new MessageEmbed()
                    .setAuthor({name: `${user?.tag}'s drawing`, iconURL: 'https://cdn-icons-png.flaticon.com/512/4229/4229137.png'})
                    .setColor('#fff47a')
                    .addField(`Category`, `Object`, true)
                    .addField(`Hint`, `${hint}`, true)
                    .setFooter({text: `you have 1 minute to guess the drawing`, iconURL: 'https://cdn-icons-png.flaticon.com/512/1479/1479689.png'})
                    .setImage(imgurUrl)

                dgEmbed.setColor('#ff6666')
                dgEmbed.setFooter({text: `you have 20 seconds remaining to guess`, iconURL: 'https://cdn-icons-png.flaticon.com/512/1479/1479689.png'})

                channel?.send({
                    embeds: [dgEmbed]
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));
            }
        }
    }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));

    checkGameState(channel, user, randWord);
}

// check on the status of the current game
async function checkGameState(channel, user, randWord) {
    // give the guessers another 20 seconds to guess the drawing
    await sleep(20000)

    await mongo().then(async () => {
        const results = await sketchSchema.find({})

        for (const data of results) {
            const currentDrawer = data.currentDrawer;
            const wasGuessed = data.wasGuessed;
            const gameState = data.gameState;

            // if nobody guessed the drawing, we can reset the entries and allow another person to start a round
            if (!wasGuessed) {
                await sketchSchema.findOneAndUpdate({}, {
                    currentWord: 'null',
                    currentDrawer: 'null',
                    previousDrawer: currentDrawer,
                    urlId: 'null',
                    gameState: false,
                    hasEnded: false
                }, {
                    upsert: true
                }) // catch

                if (gameState) {
                    channel?.send({
                        content: `${process.env.BOT_DENY} **Unlucky!** No one guessed the word. The word was \`${randWord.toUpperCase()}\`
> Use \`/sketchguess draw\` to start a new round`
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                }

                // set the channel permissions so that the drawer can send message
                channel.permissionOverwrites.delete(user?.id).catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a channel's permissions: `, err));
            }

            // if the drawing was guessed, we can reset the entries and allow another person to start a round
            // this is also handled in /games/doodle_guess.js - not sure if needed in both
            if (wasGuessed) {
                await sketchSchema.findOneAndUpdate({}, {
                    currentWord: 'null',
                    currentDrawer: 'null',
                    previousDrawer: currentDrawer,
                    urlId: 'null',
                    gameState: false,
                    wasGuessed: false,
                    hasEnded: false
                }, {
                    upsert: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                // set the channel permissions so that the drawer can send message
                channel.permissionOverwrites.delete(user?.id).catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a channel's permissions: `, err));
            }
        }
    }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));
}

module.exports = {
    name: `sketchguess`,
    description: `Command menu for the Sketch Guess game`,
    permission: ``,
    cooldown: 5,
    type: `CHAT_INPUT`,
    options: [{
        name: `draw`,
        description: `Elect yourself to draw`,
        type: `SUB_COMMAND`,
        usage: `/sketchguess draw`,
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
        // TODO : consider removing the timer for guessing and just allow people the guess as they please

        const {channel, user, member, options} = interaction;

        switch (options.getSubcommand()) {
            case 'draw': {
                // only allow the command to be ran in the Sketch Guess channel
                if (channel?.id !== process.env.SKETCH_CHAN) {
                    interaction.reply({
                        content: `You can only use this command in the <#${process.env.SKETCH_CHAN}> channel`,
                        ephemeral: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem : `, err));
                }

                await mongo().then(async () => {
                    const results = await sketchSchema.find({})

                    // if there is no data about the game, we should add some
                    if (results.length === 0) {
                        await sketchSchema.findOneAndUpdate({}, {
                            currentWord: 'null',
                            currentDrawer: 'null',
                            previousDrawer: 'null',
                            urlId: 'null',
                            gameState: false,
                            wasGuessed: false,
                            hasEnded: false
                        }, {
                            upsert: true
                        }) // catch
                        initGame(user, interaction, channel);
                    } else {
                        // disallow a user to draw 2 times in a row - though staff is allowed do this
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
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));
                break;
            }
            case 'end': {
                // allow a user to end their turn early for whatever reason
                // only allow the command to be ran in the Sketch Guess channel
                if (channel?.id !== process.env.SKETCH_CHAN) {
                    interaction.reply({
                        content: `You can only use this command in the <#${process.env.SKETCH_CHAN}> channel`,
                        ephemeral: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem : `, err));
                }

                await mongo().then(async () => {
                    const results = await sketchSchema.find({})

                    for (const data of results) {
                        const currentDrawer = data.currentDrawer;

                        // only allow the current drawer or a staff member to end the turn early
                        if (user?.id === currentDrawer) {
                            await sketchSchema.findOneAndUpdate({}, {
                                currentWord: 'null',
                                currentDrawer: 'null',
                                previousDrawer: currentDrawer,
                                urlId: 'null',
                                gameState: false,
                                wasGuessed: false,
                                hasEnded: true
                            }, {
                                upsert: true
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                            interaction.reply({
                                content: `${process.env.BOT_INFO} **Hmm!** ${user} ended their round early
> Use \`/sketchguess draw\` to start a new round`,
                                allowedMentions: {
                                    parse: []
                                }
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

                            // set the channel permissions so that the drawer can send message
                            channel.permissionOverwrites.delete(currentDrawer).catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a channel's permissions: `, err));
                        } else if (member?.roles?.cache.has(process.env.STAFF_ROLE)) {
                            await sketchSchema.findOneAndUpdate({}, {
                                currentWord: 'null',
                                currentDrawer: 'null',
                                previousDrawer: currentDrawer,
                                urlId: 'null',
                                gameState: false,
                                wasGuessed: false,
                                hasEnded: true
                            }, {
                                upsert: true
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                            interaction.reply({
                                content: `${process.env.BOT_INFO} **Hmm!** A staff member ended the round early
> Use \`/sketchguess draw\` to start a new round`,
                                allowedMentions: {
                                    parse: []
                                }
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

                            // set the channel permissions so that the drawer can send message
                            channel.permissionOverwrites.delete(currentDrawer).catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a channel's permissions: `, err));
                        } else {
                            interaction.reply({
                                content: `You can't end the turn as you're not the current drawer`,
                                ephemeral: true
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                        }
                    }
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));
            }
        }
    }
}