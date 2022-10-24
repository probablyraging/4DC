const { EmbedBuilder } = require("discord.js");
const timerSchema = require("../../schemas/misc/timer_schema");
const path = require("path");

module.exports = async (client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const ckqChannel = guild.channels.cache.get(process.env.SPOTLIGHT_CHAN);
    const ckqRole = guild.roles.cache.get(process.env.SPOTLIGHT_ROLE);

    setInterval(async () => {
        let dbTimestamp;
        const results = await timerSchema.find({ searchFor: 'currentTime' });

        for (const info of results) {
            const { timestamp } = info;
            dbTimestamp = timestamp;
        }

        const ckEmbed = new EmbedBuilder()
            .setColor("#44eaff") // GREEN
            .setTitle(`:crown: Content Spotlight`)
            .setDescription(`**What Is It?**
Every 5 hours the channel will unlock, allowing anyone to post a single link to their content to claim the channel. The channel will then be locked again, allowing that person's content to be centre of attention for the next 5 hours. The person who claims the channel will also be given the <@&878229140992589906> role to stand out in chat`);

        const myDate = new Date();
        const nowTime = myDate.setSeconds(myDate.getSeconds() + 1);

        if (dbTimestamp && nowTime > dbTimestamp) {
            await ckqChannel.bulkDelete(10).catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));

            await ckqRole.members.each(member => {
                member.roles.remove(ckqRole).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a role: `, err));
            });

            await ckqChannel.permissionOverwrites.edit(guild.id, {
                SendMessages: true,
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err));

            await timerSchema.updateOne({
                searchFor: 'currentTime'
            }, {
                timestamp: "null"
            }, {
                upsert: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

            await ckqChannel.send({
                embeds: [ckEmbed]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err))
        }
    }, 300000);
};
