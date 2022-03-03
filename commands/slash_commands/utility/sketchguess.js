const { ContextMenuInteraction, MessageEmbed } = require('discord.js');
const mongo = require('../../../mongo');
const { words } = require('../../../lists/sketch-words');
const { v4: uuidv4 } = require("uuid");
const { ImgurClient } = require('imgur');
const fs = require('fs');
const sleep = require("timers/promises").setTimeout;
const path = require('path');
const sketchSchema = require('../../../schemas/sketch_guess/sketch_schema');
const puppeteer = require("puppeteer");

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
> ✏️ **You have 3 minutes to draw the word \`${randWord.toUpperCase()}\`**
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
                    const dgEmbed = new MessageEmbed()
                        .setAuthor({ name: `It's ${user?.tag}'s turn to draw`, iconURL: 'https://cdn-icons-png.flaticon.com/512/3767/3767273.png' })
                        .setColor('#a2ff91')
                        .setDescription(`${user} has 3 minutes to draw you their word`)
                        .setImage('https://i.imgur.com/LA0Rzpk.jpg')
                        .setFooter({ text: `check back soon..`, iconURL: 'https://cdn-icons-png.flaticon.com/512/1479/1479689.png' })

                    channel?.send({
                        embeds: [dgEmbed]
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

                    // sleep for 3 minutes and then fetch the drawing
                    await sleep(180000);
                }
            }

            fetchDrawing(channel, user, customId, randWord);
        }
    }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));
}

// fetch the current drawing
async function fetchDrawing(channel, user, customId, randWord) {
    // Fetch the drawing from the website
    let websiteUrl = `https://wbo.ophir.dev/boards/${user.username}${customId}`;
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    // Set our viewport
    await page.setViewport({
        width: 2160,
        height: 1080
    })

    await page.goto(websiteUrl, {
        waitUntil: 'networkidle0'
    });

    // Get the image as a base64 string, so we don't need to save it locally
    await page.screenshot({
        encoding: "base64",
        clip: {
            x: 60,
            y: 0,
            width: 2100,
            height: 1080
        }
    }).then(imageBase64 => {
        uploadDrawing(channel, user, randWord, imageBase64);
    });

    // Close browser and cleanup
    await browser.close();
}

// upload the drawing to the Sketch Guess channel
async function uploadDrawing(channel, user, randWord, imageBase64) {

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
                .setAuthor({ name: `${user?.tag}'s drawing`, iconURL: 'https://cdn-icons-png.flaticon.com/512/4229/4229137.png' })
                .setColor('#fff47a')
                .addField(`Category`, `Object`, true)
                .addField(`Hint`, `${hint}`, true)
                .setFooter({ text: `take your time to guess the drawing`, iconURL: 'https://cdn-icons-png.flaticon.com/512/1479/1479689.png' })

            // upload the local drawing file to IMGUR and then upload it to the Sketch Guess channel
            const imgur = new ImgurClient({ clientId: process.env.IMGUR_ID, clientSecret: process.env.IMGUR_SECRET });

            const response = await imgur.upload({
                image: imageBase64,
                type: 'base64',
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem uploading an image to imgur: `, err));

            let imgurUrl;
            response.forEach(res => {
                imgurUrl = res.data.link
                dgEmbed.setImage(imgurUrl);
            });

            // if the drawing was guessed or if the round has ended, we can stop here
            if (wasGuessed || hasEnded) return;

            channel?.send({
                embeds: [dgEmbed]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));

            // TODO : message collector - when X amount of guesses have been sent, the initial embed will be pushed off screen so we should send it again
        }
    }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));

    checkGameState(channel, user, randWord);
}

// check on the status of the current game
async function checkGameState(channel, user, randWord) {
    // TODO : maybe add a skip command - if X amount of people elect to skip a bad drawing we can start a new round
    // give the guessers another 20 seconds to guess the drawing
    await sleep(30000)

    await mongo().then(async () => {
        const results = await sketchSchema.find({})

        for (const data of results) {
            const currentDrawer = data.currentDrawer;
            const wasGuessed = data.wasGuessed;

            // if the drawing was guessed, we can reset the entries and allow another person to start a round
            // this is also handled in /games/sketch_games.js - not sure if needed in both
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
        const { channel, user, member, options } = interaction;

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

                            const dgEmbed = new MessageEmbed()
                                .setAuthor({ name: `Game Over`, iconURL: 'https://cdn-icons-png.flaticon.com/512/5553/5553850.png' })
                                .setColor('#ff8a8a')
                                .setDescription(`${user?.tag} has ended the round early`)
                                .setFooter({ text: `use '/sketchguess draw' to start a new round`, iconURL: 'https://cdn-icons-png.flaticon.com/512/1479/1479689.png' })

                            interaction.reply({
                                embeds: [dgEmbed]
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

                            const dgEmbed = new MessageEmbed()
                                .setAuthor({ name: `Game Over`, iconURL: 'https://cdn-icons-png.flaticon.com/512/5553/5553850.png' })
                                .setColor('#ff8a8a')
                                .setDescription(`A staff member has ended the round early`)
                                .setFooter({ text: `use '/sketchguess draw' to start a new round`, iconURL: 'https://cdn-icons-png.flaticon.com/512/1479/1479689.png' })

                            interaction.reply({
                                embeds: [dgEmbed]
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