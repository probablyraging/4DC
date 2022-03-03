const { Message } = require('discord.js');
const mongo = require('../../mongo');
const path = require('path');
const doodleSchema = require('../../schemas/doodle_guess/doodle_schema');
/**
 * @param {Message} message 
 */
module.exports = async (message, client) => {
    // TODO : command to start the game, this also sets a new word for the drawer to draw
    //        the person who starts the game draws
    //        the person to guess the drawing wins and draws next
    //        when a game starts or a new word is given, upload it to database
    //        uuid as custom URL ID
    //        add new drawer to the database
    //        pick a random word from a list of object
    //        when a random word is picked, store it in the database
    //        store the current unique URL in database
    //        don't let people draw 2 times in a row
    //        store the last person who drew in a variable
    //        set perms to disallow the drawer to type in DG channel

    if (message?.channel.id === process.env.DOODLE_CHAN && !message?.author.bot) {
        const guess = message?.content.toLowerCase();
        const guesser = message?.author;

        await mongo().then(async mongoose => {
            const results = await doodleSchema.find({})

            for (const data of results) {
                // if the drawer tries to guess their own drawing, delete the message
                if (guesser.id === data.currentDrawer) {
                    return message?.delete() //catch
                }

                if (guess === data.currentWord) {
                    message?.react('🎉');

                    message?.channel.send({
                        content: `🎉 **Correct!** ${guesser} guessed the word \`${guess.toUpperCase()}\` and won the round!
> Use \`/doodleguess draw\` to start a new round`,
                        allowedMentions: {
                            parse: []
                        }
                    }) // catch
                }
            }
        }) // catch
    }
}