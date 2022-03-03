const { ContextMenuInteraction, MessageAttachment } = require('discord.js');
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
        // TODO : check to see if game is already running
        //        check to see if there is already a drawer
        //        add new drawer to the database
        //        pick a random word from a list of object
        //        when a random word is picked, store it in the database
        //        store the current unique URL in database
        //        don't let people draw 2 times in a row

        const { channel, user } = interaction;

        const customId = uuidv4();
        const canvasUrl = `https://wbo.ophir.dev/boards/${user.username}${customId}#0,0,0.85`;
        const randNum = Math.floor(Math.random() * words.length);

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
                    urlId: 'null',
                    gameState: false,
                    wasGuessed: false
                }, {
                    upsert: true
                }) // catch

                initGame();
            } else {
                initGame();
            }
        }) // catch

        async function initGame() {
            await mongo().then(async mongoose => {
                const results = await doodleSchema.find({})

                for (const data of results) {
                    const gameState = data.gameState;
                    const wasGuessed = data.wasGuessed;

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
                            currentWord: words[randNum],
                            currentDrawer: user.id,
                            urlId: customId,
                            gameState: true
                        }, {
                            upsert: true
                        }) // catch

                        interaction.reply({
                            content: `*It's your turn to draw!*
> ✏️ **You have 2 minutes to draw the word \`${words[randNum].toUpperCase()}\`**
> [Click here to start drawing!](<${canvasUrl}>)`,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));


                        // sleep for 2 minutes and then fetch the drawing
                        await sleep(60000);
                        fetchDrawing();
                    }
                }
            }) // catch
        }

        async function checkGameState() {
            await sleep(120000)
            
            await mongo().then(async mongoose => {
                const results = await doodleSchema.find({})

                for (const data of results) {
                    const wasGuessed = data.wasGuessed;

                    // if the word was guessed then we don't need to do anything else as it should be handled in /games/doodle_game.js
                    if (wasGuessed) return;

                    // if the word wasn't guessed, we can reset the entries and allow another person to start a round 
                    if (!wasGuessed) {
                        await doodleSchema.findOneAndUpdate({
                        }, {
                            currentWord: 'null',
                            currentDrawer: 'null',
                            urlId: 'null',
                            gameState: false
                        }, {
                            upsert: true
                        }) // catch

                        // send a message saying the game ended
                        // no one guessed the drawing, try again with command
                    }
                }
            }) // check
        }

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
            });
        }

        async function uploadDrawing() {
            await sleep(1000)
            console.log('sending image')

            const imgur = new ImgurClient({ clientId: process.env.IMGUR_ID, clientSecret: process.env.IMGUR_SECRET });

            const response = await imgur.upload({
                image: fs.createReadStream(`./${user.username}${customId}.jpg`),
                type: 'stream',
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem uploading an image to imgur: `, err));

            response.forEach(res => {
                imgUrl = res.data.link;
            });

            fs.unlink(`./${user.username}${customId}.jpg`, function (err) {
                if (err) return;
            });

            channel.send(imgUrl) // catch

            // wait 2 minutes and then check the game state
            checkGameState();
        }
    }
}