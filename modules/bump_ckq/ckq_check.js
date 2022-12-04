const { EmbedBuilder } = require("discord.js");
const timerSchema = require("../../schemas/misc/timer_schema");
const path = require("path");

module.exports = async (client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const ckqChannel = guild.channels.cache.get(process.env.SPOTLIGHT_CHAN);
    const ckqRole = guild.roles.cache.get(process.env.SPOTLIGHT_ROLE);

    setInterval(async () => {
        let dbTimestamp;
        const results = await timerSchema.find({ timer: 'spotlight' });

        for (const info of results) {
            const { timestamp } = info;
            dbTimestamp = timestamp;
        }

        const myDate = new Date();
        const nowTime = myDate.setSeconds(myDate.getSeconds() + 1);

        if (dbTimestamp && nowTime > dbTimestamp) {
            (await ckqChannel.messages.fetch()).forEach(message => {
                if (!message.author.bot) message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
            });

            await ckqRole.members.each(member => {
                member.roles.remove(ckqRole).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a role: `, err));
            });

            await ckqChannel.permissionOverwrites.edit(guild.id, {
                SendMessages: true,
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err));

            await timerSchema.updateOne({
                timer: 'spotlight'
            }, {
                timestamp: "null"
            }, {
                upsert: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
        }
    }, 300000);
};
