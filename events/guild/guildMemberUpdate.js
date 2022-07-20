const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const muteTimeoutSchema = require('../../schemas/database_logs/mute_timeout_schema');
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

            function converTimestampToSimpleFormat(timestamp) {
                const t = new Date(timestamp);
                const date = ('0' + t.getDate()).slice(-2);
                const month = ('0' + (t.getMonth() + 1)).slice(-2);
                const year = t.getFullYear();
                let hours = ('0' + t.getHours()).slice(-2);
                const minutes = ('0' + t.getMinutes()).slice(-2);
                const seconds = ('0' + t.getSeconds()).slice(-2);
                let meridiem = 'AM';
                if (hours > 12 && hours < 22) {
                    hours = (hours - 2).toString().slice(-1);
                    meridiem = 'PM';
                } else if (hours >= 21) {
                    hours = '1' + (hours - 2).toString().slice(-1);
                    meridiem = 'PM';
                }
                if (hours === '12') meridiem = 'PM';
                if (hours === '00') hours = '12';
                const time = `${date}/${month}/${year}, ${hours}:${minutes}${meridiem}`;
                return time;
            }

            const expiresAt = new Date(oldMember.communicationDisabledUntilTimestamp).toUTCString();

            // Log to channel
            let log = new EmbedBuilder()
                .setColor("#E04F5F")
                .setAuthor({ name: `${executor?.tag}`, iconURL: executor?.displayAvatarURL({ dynamic: true }) })
                .setDescription(`**Member:** ${oldMember?.user.tag} *(${oldMember?.user.id})*
**Expires:** ${expiresAt}
**Reason:** ${toReason}`)
                .setFooter({ text: `Timeout • ${uuidv4()}`, iconURL: 'https://www.creatorhub.info/images/creatorhub/timeout_icon.png' })
                .setTimestamp();

            logChan.send({
                embeds: [log]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));

            // Log to database for dashboard
            await muteTimeoutSchema.create({
                userId: oldMember?.user.id,
                username: oldMember?.user.tag,
                author: executor?.id,
                authorTag: `${executor?.username}#${executor?.discriminator}`,
                reason: toReason,
                timestamp: timestamp,
                type: 'Timeout'
            });
        }
    }
}



