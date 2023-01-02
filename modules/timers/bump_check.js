const timerSchema = require("../../schemas/misc/timer_schema");
const path = require("path");

module.exports = async (client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const bumpChan = guild.channels.cache.get(process.env.BUMP_CHAN);

    setInterval(async () => {
        const results = await timerSchema.findOne({ timer: 'bump' });
        if (!results) return;
        const { timestamp } = results;
        if (Date.now() > timestamp) {
            bumpChan.permissionOverwrites.edit(guild.id, {
                SendMessages: true,
            }).then(() => {
                return bumpChan.send({
                    content: `:mega: <@&${process.env.BUMP_ROLE}> The server can be bumped again by using the </bump:947088344167366698> command!`
                });
            }).then(async () => {
                await bumpTimer.updateOne({
                    timestamp: "null"
                });
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem with updating the bump channel: `, err));
        }
    }, 300000);
}