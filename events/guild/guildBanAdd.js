const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

module.exports = {
    name: 'guildBanAdd',
    async execute(ban, client, Discord) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const logChan = guild.channels.cache.get(process.env.LOG_CHAN);

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
                .setFooter({ text: `Ban • ${uuidv4()}`, iconURL: './res/images/creatorhub/ban_icon.png' })
                .setTimestamp();

            logChan.send({
                embeds: [log]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));
        }, 2000);
    }
}