const mongo = require("../../mongo");
const timerSchema = require("../../schemas/misc/timer_schema");
const path = require("path");

module.exports = async (client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const bumpChan = guild.channels.cache.get(process.env.BUMP_CHAN);

    await mongo().then(async () => {
        setInterval(async () => {
            let dbTimestamp;
            const searchFor = "bumpTime";

            const results = await timerSchema.find({searchFor});

            for (const info of results) {
                const {timestamp} = info;

                dbTimestamp = timestamp;
            }

            const myDate = new Date();
            const nowTime = myDate.setSeconds(myDate.getSeconds() + 1);

            if (dbTimestamp && nowTime > dbTimestamp) {
                bumpChan.permissionOverwrites.edit(guild.id, {
                    SEND_MESSAGES: true,
                }).then(() => {
                    return bumpChan.send({
                        content: `:mega: <@&${process.env.BUMP_ROLE}> The server can be bumped again!`
                    });
                }).then(async () => {
                    await timerSchema.findOneAndUpdate({
                        searchFor
                    }, {
                        timestamp: "null",
                        searchFor
                    }, {
                        upsert: true
                    })
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem with updating the bump channel: `, err));
            }
        }, 30000);
    }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));
};
