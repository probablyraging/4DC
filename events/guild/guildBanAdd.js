const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const banUnbanSchema = require('../../schemas/database_logs/ban_unban_schema');
const { logToChartData } = require('../../modules/dashboard/log_to_database');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

module.exports = {
    name: 'guildBanAdd',
    async execute(ban, client, Discord) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const logChan = guild.channels.cache.get(process.env.LOG_CHAN);
        const timestamp = new Date().getTime();

        setTimeout(async () => {
            const fetchedLogs = await guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MemberBanAdd,
            });

            const banLog = fetchedLogs.entries.first();
            const { executor, reason } = banLog;
            const toReason = reason || `None`;

            // Log to channel
            let log = new EmbedBuilder()
                .setColor("#E04F5F")
                .setAuthor({ name: `${executor?.tag}`, iconURL: executor?.displayAvatarURL({ dynamic: true }) })
                .setDescription(`**Member:** ${ban?.user.tag} *(${ban?.user.id})*
**Reason:** ${toReason}`)
                .setFooter({ text: `Ban • ${uuidv4()}`, iconURL: 'https://www.creatorhub.info/images/creatorhub/ban_icon.png' })
                .setTimestamp();

            logChan.send({
                embeds: [log]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));

            // Log to database for dashboard
            await banUnbanSchema.create({
                userId: ban?.user.id,
                username: ban?.user.tag,
                author: executor?.id,
                authorTag: `${executor?.username}#${executor?.discriminator}`,
                reason: reason,
                timestamp: timestamp,
                type: 'Ban'
            });
        }, 2000);

        // Database charts
        logToChartData('bans');
    }
}