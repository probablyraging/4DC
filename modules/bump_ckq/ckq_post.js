const { Message } = require('discord.js');
const timerSchema = require('../../schemas/misc/timer_schema');
const blacklist = require('../../lists/blacklist');
const path = require('path');
/**
 * 
 * @param {Message} message 
 */
module.exports = async (message) => {
    if (message?.channel.id === process.env.CKQ_CHAN && !message?.author.bot) {
        for (var i in blacklist.links) {
            if (message?.content.toLowerCase().includes(blacklist.links[i].toLowerCase())) return;
        }

        const ckqChannel = message?.channel;
        const ckqRole = message?.guild.roles.cache.get(process.env.CKQ_ROLE);
        const target = message?.member;

        function detectURLs(message) {
            var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
            return message.match(urlRegex)
        }

        // we only allow 1 link per post
        if (detectURLs(message.content.toLowerCase()) == null) {
            return message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        } else {
            if (detectURLs(message.content.toLowerCase()).length > 1) {
                target?.send({
                    content: `${process.env.BOT_DENY} You can only post 1 link in #${ckqChannel}`
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message to a user. This usually happens when the target has DMs disabled: `, err));
                return setTimeout(() => { message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 600);
            }
        }

        ckqChannel.permissionOverwrites.edit(message?.guildId, {
            SendMessages: false,
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err));

        target?.roles?.add(ckqRole).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));

        const myDate = new Date();
        const addTwo = myDate.setHours(myDate.getHours() + 5);
        const timestamp = addTwo;

        const searchFor = 'currentTime';

        await timerSchema.findOneAndUpdate({
            searchFor
        }, {
            timestamp,
            searchFor
        }, {
            upsert: true
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
    }
}