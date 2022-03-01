const { Message } = require('discord.js');
const path = require('path');
/**
 * @param {Message} message 
 */
module.exports = (message) => {
    /**
     * This blacklist focuses on deleting links other than twitch.tv links in the twitch promo channel
     */
    if (message?.deleted) return;
    
    const member = message?.member;

    if (message?.channel.id === process.env.TWITCH_PROMO && !message?.content.toLowerCase().includes('twitch.tv/') && !message?.author?.bot) {
        member?.send({
            content: `${process.env.BOT_DENY} \`#${message?.channel.name} is for Twitch links only\``
        }).catch(() => {
            message?.reply({
                content: `${process.env.BOT_DENY} \`This channel is for Twitch links only\``,
                allowedMentions: { repliedUser: true },
                failIfNotExists: false
            }).catch(err => {
                console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
            }).then(msg => {
                setTimeout(() => { msg?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 5000);
            });
        });

        setTimeout(() => { message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 600);
    }
}