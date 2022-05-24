const { MessageEmbed } = require('discord.js');
const mongo = require("../../mongo");
const banUnbanSchema = require('../../schemas/dashboard_logs/ban_unban_schema');
const path = require('path');

module.exports = {
    name: 'guildBanRemove',
    execute(ban, client, Discord) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const banChan = client.channels.cache.get(process.env.BAN_CHAN);
        const timestamp = new Date().getTime();

        setTimeout(async () => {
            const fetchedLogs = await guild.fetchAuditLogs({
                limit: 1,
                type: 'MEMBER_BAN_REMOVE',
            });

            const banLog = fetchedLogs.entries.first();
            const { executor } = banLog;

            const log = new MessageEmbed()
                .setColor('#32BEA6')
                .setAuthor({ name: `${ban?.user.tag} has been unbanned`, iconURL: ban?.user.displayAvatarURL({ dynamic: true }) })
                .addField(`Unbanned By`, `${executor}`, true)
                .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
                .setTimestamp()

            banChan.send({
                embeds: [log]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));

            // Log to database for dashboard
            await mongo().then(async mongoose => {
                await banUnbanSchema.create({
                    userId: ban?.user.id,
                    username: ban?.user.tag,
                    author: executor?.id,
                    authorTag: `${executor?.username}#${executor?.discriminator}`,
                    timestamp: timestamp,
                    type: 'Unban'
                });
            });
        }, 2000);
    }
}