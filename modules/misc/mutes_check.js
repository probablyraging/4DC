const mongo = require('../../mongo');
const muteSchema = require('../../schemas/misc/mute_schema');
const path = require('path');


module.exports = async (message, client, Discord) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    setInterval(async () => {
        await mongo().then(async mongoose => {
            try {
                const results = await muteSchema.find({ timestamp: { $gt: 0 } }).catch(err => { return console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err) });

                for (const data of results) {
                    const { timestamp, userId, channelId } = data;

                    const myDate = new Date();
                    const nowTime = myDate.setSeconds(myDate.getSeconds() + 1);

                    if (nowTime > timestamp) {
                        await muteSchema.findOneAndRemove({ userId }).catch(err => { return console.error(`${path.basename(__filename)} There was a problem removing a database entry: `, err) });

                        const target = client.users.cache.get(userId);
                        const targetChan = guild.channels.cache.get(channelId);

                        targetChan.permissionOverwrites.delete(userId)
                            .catch(err => { return console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err) });

                        target?.send({
                            content: `${process.env.BOT_DENY} \`You have been unmuted in #${targetChan.name} on ${guild.name}\``
                        }).catch(err => { return; })
                    }
                }
            } finally {
                // do nothing
            }
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));
    }, 30000);
}