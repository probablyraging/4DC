const { Message } = require('discord.js');
/**
 * 
 * @param {Message} message 
 */
module.exports = async (message, client, Discord) => {

    if (message?.channel.id === process.env.INVITE_CHAN && message?.author.id === process.env.INVTRACK_ID) {

        if (message?.content.includes(` has been invited `)) {
            message?.delete()
                .catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
            message?.channel.send({ content: `${message?.content}` })
                .catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
        }
        else if (message?.content.includes(` joined using `)) {
            message?.delete()
                .catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
            message?.channel.send({ content: `${message?.content}` })
                .catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
        }
        else if (message?.content.includes(` can not figure `)) {
            message?.delete()
                .catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
            message?.channel.send({ content: `${message?.content}` })
                .catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
        }
    }
}