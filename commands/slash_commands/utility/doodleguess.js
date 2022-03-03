const { ContextMenuInteraction, MessageEmbed } = require('discord.js');
const mongo = require('../../../mongo');
const { words } = require('../../../lists/doodle-words');
const { v4: uuidv4 } = require("uuid");
const webshot = require('webshot-node');
const { ImgurClient } = require('imgur');
const fs = require('fs');
const sleep = require("timers/promises").setTimeout;
const path = require('path');
const doodleSchema = require('../../../schemas/doodle_guess/doodle_schema');

module.exports = {
    name: `doodleguess`,
    description: `Command meny for the Doodle Guess game`,
    permission: ``,
    cooldown: 5,
    type: `CHAT_INPUT`,
    options: [{
        name: `draw`,
        description: `Elect yourself to draw`,
        type: `SUB_COMMAND`,
        usage: `/doodleguess draw`,
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        // TODO : don't let people draw 2 times in a row
        //        end turn command
        //        add image to embed and have some hints about the word _ _ _ _

        const { channel, user } = interaction;

        const customId = uuidv4();
        const canvasUrl = `https://wbo.ophir.dev/boards/${user.username}${customId}#0,0,0.85`;
        const randNum = Math.floor(Math.random() * words.length);
        const randWord = words[randNum];

        // only allow the command to be ran in the Doodle Guess channel
        if (channel.id !== process.env.DOODLE_CHAN) {
            interaction.reply({
                content: `You can only use this command in the <#${process.env.DOODLE_CHAN}> channel`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }

        await mongo().then(async mongoose => {
            const results = await doodleSchema.find({})

            // if there is no data about the game, we should add some
            if (results.length === 0) {
                await doodleSchema.findOneAndUpdate({
                }, {
                    currentWord: 'null',
                    currentDrawer: 'null',
                    previousDrawer: 'null',
                    urlId: 'null',
                    gameState: false,
                    wasGuessed: false
                }, {
                    upsert: true
                }) // catch

                initGame();
            } else {
                // disallow a user to draw 2 times in a row
                // for (const data of results) {
                //     if (user.id === data.previousDrawer) {
                //         return interaction.reply({
                //             content: `You can't draw 2 times in a row. Wait for someone else to draw before trying again`,
                //             ephemeral: true
                //         }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                //     }
                // }

                initGame();
            }
        }) // catch

        async function initGame() {
            await mongo().then(async mongoose => {
                const results = await doodleSchema.find({})

                for (const data of results) {
                    const gameState = data.gameState;

                    // check the current game state to see if there is a game currently in progress or not
                    // if there is a current game in progress
                    if (gameState) {
                        interaction.reply({
                            content: `There is currently a game of Doodle Guess in progress, join in <#${process.env.DOODLE_CHAN}>, or wait for the round to end`,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    }

                    // if there is not current game in progress
                    if (!gameState) {
                        await doodleSchema.findOneAndUpdate({
                        }, {
                            currentWord: randWord,
                            currentDrawer: user.id,
                            urlId: customId,
                            gameState: true
                        }, {
                            upsert: true
                        }) // catch

                        interaction.reply({
                            content: `*It's your turn to draw!*
> ✏️ **You have 2 minutes to draw the word \`${randWord.toUpperCase()}\`**
> [Click here to start drawing!](<${canvasUrl}>)

*warning: do not dismiss this message until you have opened the link above*`,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                        // sleep for 5 seconds to allow the user time to load the webpage
                        await sleep(5000)

                        const getReady = await channel.send({
                            content: `It's ${user}'s turn to draw. They have 2 minutes to draw the word`,
                            allowedMentions: {
                                parse: []
                            }
                        }) // catch

                        // sleep for 2 minutes and then fetch the drawing
                        await sleep(3000);

                        const fetch = await channel.messages.fetch(getReady.id) // catch
                        fetch.delete() // catch

                        fetchDrawing();
                    }
                }
            }) // catch
        }

        // fetch the current drawing
        async function fetchDrawing() {
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

            webshot(`https://wbo.ophir.dev/boards/${user.username}${customId}`, `${user.username}${customId}.jpg`, options, function (err) {
                if (err) return;
                if (!err) {
                    console.log('SCREENSHOT')
                    uploadDrawing();
                }
            }) // catch
        }

        // upload the drawing to the Doodle Guess channel
        async function uploadDrawing() {
            // give the image time to be saved locally
            await sleep(5000)
            console.log('SENDING SCREENSHOT')

            var hint = ``;
            for (var i = 0; i < randWord.length; i++) {
                hint += '\\_ '
            }

            const dgEmbed = new MessageEmbed()
                .setAuthor({ name: `${user.tag}'s drawing`, iconURL: 'https://cdn-icons-png.flaticon.com/512/4229/4229137.png' })
                .setColor('#fff47a')
                .addField(`Category`, `Object`, true)
                .addField(`Hint`, `${hint}`, true)
                .setFooter({ text: `you have 1 minute to guess the drawing`, iconURL: 'https://cdn-icons-png.flaticon.com/512/1479/1479689.png' })

            const imgur = new ImgurClient({ clientId: process.env.IMGUR_ID, clientSecret: process.env.IMGUR_SECRET });

            const response = await imgur.upload({
                image: fs.createReadStream(`./${user.username}${customId}.jpg`),
                type: 'stream',
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem uploading an image to imgur: `, err));

            response.forEach(res => {
                imgurUrl = res.data.link
                dgEmbed.setImage(imgurUrl);
            });

            fs.unlink(`./${user.username}${customId}.jpg`, function (err) {
                if (err) return;
            });

            channel?.send({
                embeds: [dgEmbed]
            }) // catch

            // wait for 40 seconds and then resend the image
            await sleep(4000)

            await mongo().then(async mongoose => {
                const results = await doodleSchema.find({})

                for (const data of results) {
                    const wasGuessed = data.wasGuessed;

                    if (!wasGuessed) {
                        dgEmbed.setColor('#ff6666')
                        dgEmbed.setFooter({ text: `you have 20 seconds remaining to guess`, iconURL: 'https://cdn-icons-png.flaticon.com/512/1479/1479689.png' })

                        channel?.send({
                            embeds: [dgEmbed]
                        }) // catch
                    }
                }
            }) // catch

            checkGameState();
        }

        // check on the status of the current game
        async function checkGameState() {
            // give the guessers 1 minute to guess the drawing
            // sed a message explaining this

            await sleep(3000)
            console.log('UPDATING DATABASE')

            await mongo().then(async mongoose => {
                const results = await doodleSchema.find({})

                for (const data of results) {
                    const currentDrawer = data.currentDrawer;
                    const wasGuessed = data.wasGuessed;

                    // if the word wasn't guessed, we can reset the entries and allow another person to start a round 
                    if (!wasGuessed) {
                        await doodleSchema.findOneAndUpdate({
                        }, {
                            currentWord: 'null',
                            currentDrawer: 'null',
                            previousDrawer: currentDrawer,
                            urlId: 'null',
                            gameState: false
                        }, {
                            upsert: true
                        }) // catch

                        channel.send({
                            content: `${process.env.BOT_DENY} No one guessed correctly. The word was \`${randWord.toUpperCase()}\`
> Use \`/doodleguess draw\` to start a new round`
                        }) // catch
                    }

                    if (wasGuessed) {
                        await doodleSchema.findOneAndUpdate({
                        }, {
                            currentWord: 'null',
                            currentDrawer: 'null',
                            previousDrawer: currentDrawer,
                            urlId: 'null',
                            gameState: false,
                            wasGuessed: false
                        }, {
                            upsert: true
                        }) // catch
                    }
                }
            }) // check
        }
    }
}