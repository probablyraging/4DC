const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(newMember, oldMember, client, Discord) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const logChan = guild.channels.cache.get(process.env.LOG_CHAN);

        let error = false;

        if (oldMember.communicationDisabledUntilTimestamp > new Date().getTime()) {
            const fetchedLogs = await guild.fetchAuditLogs({
                limit: 1,
                action: AuditLogEvent.MemberUpdate,
            }).catch(err => {
                console.error(`${path.basename(__filename)} There was a problem fetching audit logs: `, err);
                error = true;
            });

            if (error) return;

            const muteLog = fetchedLogs.entries.first();
            const { executor, reason } = muteLog;
            const toReason = reason;
            const timestamp = new Date().getTime();

            // Prevent repeated logs when timed out by AutoMod
            if (oldMember?.id === executor?.id) return;

            const expiresAt = new Date(oldMember.communicationDisabledUntilTimestamp).toUTCString();
            let duration = oldMember.communicationDisabledUntilTimestamp - new Date().valueOf();
            if (duration < 3600000) {
                if (duration <= 60000) {
                    duration = Math.ceil((duration / 1000) / 60) + ' minute';
                } else {
                    duration = Math.ceil((duration / 1000) / 60) + ' minutes';
                }
            } else {
                if (duration <= 3600000) {
                    duration = Math.ceil((duration / 1000) / 60 / 60) + ' hour';
                } else {
                    duration = Math.ceil((duration / 1000) / 60 / 60) + ' hours';
                }
            }

            // Log to channel
            let log = new EmbedBuilder()
                .setColor("#E04F5F")
                .setAuthor({ name: `${executor?.tag}`, iconURL: executor?.displayAvatarURL({ dynamic: true }) })
                .setDescription(`**Member:** ${oldMember?.user.tag} *(${oldMember?.user.id})*
**Expires:** ${expiresAt}
**Duration:** ${duration}
**Reason:** ${toReason}`)
                .setFooter({ text: `Timeout • ${uuidv4()}`, iconURL: 'https://www.forthecontent.xyz/images/creatorhub/timeout_icon.png' })
                .setTimestamp();

            logChan.send({
                embeds: [log]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));
        }
    }
}



