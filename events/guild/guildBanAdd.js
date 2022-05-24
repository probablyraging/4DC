const { MessageEmbed } = require('discord.js');
const mongo = require("../../mongo");
const banUnbanSchema = require('../../schemas/database_logs/ban_unban_schema');
const path = require('path');

module.exports = {
    name: 'guildBanAdd',
    execute(ban, client, Discord) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const banChan = client.channels.cache.get(process.env.BAN_CHAN);
        const timestamp = new Date().getTime();

        setTimeout(async () => {
            const fetchedLogs = await guild.fetchAuditLogs({
                limit: 1,
                type: 'MEMBER_BAN_ADD',
            });

            const banLog = fetchedLogs.entries.first();
            const { executor, reason } = banLog;

            const log = new MessageEmbed()
                .setColor('#E04F5F')
                .setAuthor({ name: `${ban?.user.tag} has been banned`, iconURL: ban?.user.displayAvatarURL({ dynamic: true }) })
                .addField(`Banned By`, `${executor}`, true)
                .addField(`Reason`, `\`\`\`${reason}\`\`\``, false)
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
                    reason: reason,
                    timestamp: timestamp,
                    type: 'Ban'
                });
            });
        }, 2000);
    }
}