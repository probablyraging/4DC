const { Message } = require('discord.js');
const timerSchema = require('../../schemas/misc/timer_schema');
const path = require('path');
/**
 * 
 * @param {Message} message 
 */
module.exports = async (message) => {
    if (message?.channel.id === process.env.SPOTLIGHT_CHAN && !message?.author.bot) {
        const spotlightChannel = message?.channel;
        const spotlightRole = message?.guild.roles.cache.get(process.env.SPOTLIGHT_ROLE);
        const target = message?.member;

        function detectURLs(message) {
            let urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
            return message.match(urlRegex)
        }

        // we only allow 1 link per post
        if (detectURLs(message.content.toLowerCase()) == null) {
            return message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        } else {
            if (detectURLs(message.content.toLowerCase()).length > 1) {
                target?.send({
                    content: `${process.env.BOT_DENY} You can only post 1 link in #${spotlightChannel.name}`
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message to a user. This usually happens when the target has DMs disabled: `, err));
                return setTimeout(() => { message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 600);
            }
        }

        spotlightChannel.permissionOverwrites.edit(message?.guildId, {
            SendMessages: false,
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err));

        target?.roles?.add(spotlightRole).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));

        const myDate = new Date();
        // Add 5 hours to the current time
        const timestamp = myDate.setHours(myDate.getHours() + 24);

        await timerSchema.updateOne({
            timer: 'spotlight'
        }, {
            timestamp
        }, {
            upsert: true
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
    }
}