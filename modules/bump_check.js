const { Message, MessageEmbed } = require('discord.js');
const mongo = require('../mongo');
const timerSchema = require('../schemas/timer-schema');
/**
 * 
 * @param {Message} message 
 */
module.exports = async (message, client, Discord) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const bumpChan = guild.channels.cache.get(process.env.BUMP_CHAN);

    setInterval(async () => {
        const searchFor = 'bumpTime'
        await mongo().then(async mongoose => {
            try {
                const results = await timerSchema.find({ searchFor })

                for (const info of results) {
                    const { timestamp } = info;

                    dbTimestamp = timestamp;
                }

                const myDate = new Date();
                const nowTime = myDate.setSeconds(myDate.getSeconds() + 1);

                if (nowTime > dbTimestamp) {
                    bumpChan.permissionOverwrites.edit(guild.id, {
                        SEND_MESSAGES: true,
                    })

                    bumpChan.send(`:mega: <@&${process.env.BUMP_ROLE}> The server can be bumped again!`).then(msg => setTimeout(() => msg.delete(), 7200000));

                    await timerSchema.findOneAndRemove({ searchFor: 'bumpTime' })
                    await timerSchema.findOneAndUpdate({
                        timestamp: 'null',
                        searchFor
                    }, {
                        timestamp: 'null',
                        searchFor
                    }, {
                        upsert: true
                    }).catch(err => { return; });
                }
            } finally {
                return;
            }
        })
    }, 30000);
}