const { Message } = require('discord.js');
const mongo = require('../mongo');
const timerSchema = require('../schemas/timer-schema');
const path = require('path');
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
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err));

                    bumpChan.send({
                        content: `:mega: <@&${process.env.BUMP_ROLE}> The server can be bumped again!`
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err))
                        .then(msg => {
                            setTimeout(() => msg.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)), 7200000);
                        });

                    await timerSchema.findOneAndRemove({ searchFor: 'bumpTime' }).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a database entry: `, err));
                    await timerSchema.findOneAndUpdate({
                        timestamp: 'null',
                        searchFor
                    }, {
                        timestamp: 'null',
                        searchFor
                    }, {
                        upsert: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
                }
            } finally {
                // do bothing
            }
        });
    }, 30000);
}