const { Message, EmbedBuilder } = require('discord.js');
const mongo = require('../../mongo');
const sketchSchema = require('../../schemas/sketch_guess/sketch_schema');
const path = require('path');
/**
 * @param {Message} message 
 */
module.exports = async (message) => {
    let collector;
    if (message?.channel.id === process.env.SKETCH_CHAN && !message?.author.bot) {
        const guess = message?.content.toLowerCase();
        const guesser = message?.author;

        const results = await sketchSchema.find({})

        for (const data of results) {
            const currentDrawer = data.currentDrawer;

            if (message?.author.id === currentDrawer) return;

            // when a user correctly guesses the word
            if (guess === data.currentWord.toLowerCase()) {
                await sketchSchema.findOneAndUpdate({
                }, {
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
                    wasGuessed: true
                }, {
                    upsert: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                message?.react('🎉').catch(err => console.error(`${path.basename(__filename)} There was a problem reacting to a message: `, err));

                const dgEmbed = new EmbedBuilder()
                    .setAuthor({ name: `Correct Guess`, iconURL: 'https://cdn-icons-png.flaticon.com/512/610/610333.png' })
                    .setColor('#c0ff8c')
                    .setDescription(`${guesser} guessed the word \`${guess.toUpperCase()}\` and won the round!`)
                    .setFooter({ text: `• /sketchguess draw - start a new round`, iconURL: 'https://cdn-icons-png.flaticon.com/512/1479/1479689.png' })

                message?.channel.send({
                    embeds: [dgEmbed]
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                
                if (collector) collector.stop();
            }
        }
    }

    // when X amount of guesses have been sent, the initial embed will be pushed off screen so we should send it again
    let count = 0;
    if (message?.channel.id === process.env.SKETCH_CHAN) {
        if (message.embeds.length >= 1) {
            message.embeds.forEach(embed => {
                // create a new collector when a drawing is sent
                if (embed?.author?.name.toLowerCase().includes(`'s drawing`)) {
                    const drawingEmbed = message?.id;

                    collector = message?.channel.createMessageCollector();

                    collector.on('collect', async m => {
                        const results = await sketchSchema.find({});

                        for (const data of results) {
                            const gameState = data.gameState;

                            if (!gameState) return collector.stop();

                            count++;

                            if (count >= 12) {
                                count = 0;

                                collector.stop()

                                collector = message?.channel.createMessageCollector();

                                setTimeout(() => {
                                    m?.channel.messages.fetch(drawingEmbed).then(fetched => {
                                        const embed = fetched?.embeds[0];

                                        if (!embed) return;

                                        m?.channel.send({
                                            embeds: [embed]
                                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));
                                    })/*.catch(err => console.error(`${path.basename(__filename)} There was a problem fetching an embed: `, err));*/
                                }, 1500);
                            }
                        }
                        collectStop(m);
                    });
                }
            })
        }
    }

    // if the game ends, stop the collector
    function collectStop(m) {
        if (m.embeds.length >= 1) {
            m.embeds.forEach(embed => {
                if (embed?.author?.name.toLowerCase().includes(`game over`) || embed?.author?.name.toLowerCase().includes(`correct guess`)) {
                    collector.stop();
                }
            })
        }
    }
}