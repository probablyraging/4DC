const { Message } = require('discord.js');
const mongo = require('../mongo');
const timerSchema = require('../schemas/timer-schema');
/**
 * 
 * @param {Message} message 
 */
module.exports = async (message, client, Discord) => {

    if (message.channel.id === process.env.CKQ_CHAN) {
        if (message.author.bot) return;

        const ckqChannel = message?.channel;
        const ckqRole = message?.guild.roles.cache.get(process.env.CKQ_ROLE);
        const target = message?.member;

        ckqChannel.permissionOverwrites.edit(message.guildId, {
            SEND_MESSAGES: false,
        });

        target?.roles?.add(ckqRole);

        const myDate = new Date();
        const addTwo = myDate.setHours(myDate.getHours() + 5);
        const timestamp = addTwo;

        const searchFor = 'currentTime';
        await mongo().then(async mongoose => {
            await timerSchema.findOneAndRemove({ searchFor });
            try {
                await timerSchema.findOneAndUpdate({
                    timestamp,
                    searchFor
                }, {
                    timestamp,
                    searchFor
                }, {
                    upsert: true
                }).catch(err => { return; });
            } finally {
                mongoose.connection.close().catch(err => { return; });
            }
        });
    }
}