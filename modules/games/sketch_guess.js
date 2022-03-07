const { Message } = require('discord.js');
const mongo = require('../../mongo');
const sketchSchema = require('../../schemas/sketch_guess/sketch_schema');
const path = require('path');
/**
 * @param {Message} message 
 */
module.exports = async (message) => {
    if (message?.channel.id === process.env.SKETCH_CHAN && !message?.author.bot) {

        // delete any links in this channel
        const guess = message?.content.toLowerCase();
        const guesser = message?.author;

        if (guess.includes('https://') || guess.includes('http://') || guess.includes('www.')) {
            if (message?.deleted) return;
            message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        }

        await mongo().then(async mongoose => {
            const results = await sketchSchema.find({})

            for (const data of results) {
                const currentDrawer = data.currentDrawer;

                // when a user correctly guesses the word
                if (guess === data.currentWord.toLowerCase()) {
                    await sketchSchema.findOneAndUpdate({
                    }, {
                        currentWord: 'null',
                        currentDrawer: 'null',
                        previousDrawer: currentDrawer,
                        urlId: 'null',
                        gameState: false,
                        voteSkip: 0,
                        hasVoted: [],
                        wasGuessed: true
                    }, {
                        upsert: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                    message?.react('🎉').catch(err => console.error(`${path.basename(__filename)} There was a problem reacting to a message: `, err));

                    message?.channel.send({
                        content: `🎉 **Correct!** ${guesser} guessed the word \`${guess.toUpperCase()}\` and won the round!
> Use \`/sketchguess draw\` to start a new round`,
                        allowedMentions: {
                            parse: []
                        }
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

                    // set the channel permissions so that the drawer can send message
                    message?.channel.permissionOverwrites.delete(currentDrawer).catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a channel's permissions: `, err));
                }
            }
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));
    }
}