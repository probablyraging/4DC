const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const newUsers = new Set();
const path = require('path');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(newMember, oldMember, client, Discord) {
        // If a user verifies themself, remove the unverified role
        if (oldMember?.pending === false) {
            oldMember?.roles.remove(process.env.UNVERIFIED_ROLE);
            // Once a user is verified, add them to the newUser set (Extends welcome_check.js)
            if (oldMember.roles.cache.has(process.env.UNVERIFIED_ROLE)) newUsers.add(oldMember.id);
        }

        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const logChan = guild.channels.cache.get(process.env.LOG_CHAN);

        let error = false;

        if (oldMember.communicationDisabledUntilTimestamp > new Date().getTime()) {
            // Fetch auditlogs for MemberUpdate events
            const fetchedLogs = await guild.fetchAuditLogs({ limit: 1, action: AuditLogEvent.MemberUpdate, })
                .catch(err => {
                    console.error(`${path.basename(__filename)} There was a problem fetching audit logs: `, err);
                    error = true;
                });

            if (error) return;

            const muteLog = fetchedLogs.entries.first();
            const { executor, reason } = muteLog;
            const toReason = reason;

            // Prevent repeated logs when timed out by AutoMod
            if (oldMember?.id === executor?.id) return;

            // Log to channel
            let log = new EmbedBuilder()
                .setColor("#E04F5F")
                .setAuthor({ name: `${executor?.tag}`, iconURL: executor?.displayAvatarURL({ dynamic: true }) })
                .setDescription(`**Member:** ${oldMember?.user.tag} *(${oldMember?.user.id})*
**Expires:** <t:${Math.round(oldMember.communicationDisabledUntilTimestamp / 1000)}> (<t:${Math.round(oldMember.communicationDisabledUntilTimestamp / 1000)}:R>)
**Reason:** ${toReason}`)
                .setFooter({ text: `Timeout • ${uuidv4()}`, iconURL: process.env.LOG_TIMEOUT })
                .setTimestamp();

            logChan.send({
                embeds: [log]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));
        }
    },
    // Export the newUser set
    newUsers
}



