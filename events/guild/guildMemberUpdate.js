import { EmbedBuilder, AuditLogEvent } from 'discord.js';
import { v4 as uuidv4 } from 'uuid';

export default {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember, client) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const logChan = guild.channels.cache.get(process.env.LOG_CHAN);

        // Timeouts
        let error = false;
        if (newMember.communicationDisabledUntilTimestamp > new Date().getTime()) {
            // Fetch auditlogs for MemberUpdate events
            const fetchedLogs = await guild.fetchAuditLogs({ limit: 1, action: AuditLogEvent.MemberUpdate, })
                .catch(err => {
                    console.error('There was a problem fetching audit logs: ', err);
                    error = true;
                });

            if (error) return;

            const muteLog = fetchedLogs.entries.first();
            const { executor, reason } = muteLog;
            const toReason = reason;

            // Prevent repeated logs when timed out by AutoMod
            if (newMember?.id === executor?.id) return;

            // Log to channel
            let log = new EmbedBuilder()
                .setColor('#E04F5F')
                .setAuthor({ name: `${executor?.username}`, iconURL: executor?.displayAvatarURL({ dynamic: true }) })
                .setDescription(`**Member:** ${newMember?.user.username} *(${newMember?.user.id})*
**Expires:** <t:${Math.round(newMember.communicationDisabledUntilTimestamp / 1000)}> (<t:${Math.round(newMember.communicationDisabledUntilTimestamp / 1000)}:R>)
**Reason:** ${toReason}`)
                .setFooter({ text: `Timeout • ${uuidv4()}`, iconURL: process.env.LOG_TIMEOUT })
                .setTimestamp();

            logChan.send({
                embeds: [log]
            }).catch(err => console.error('There was a problem sending an embed: ', err));
        }
    }
};