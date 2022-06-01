const { MessageEmbed } = require('discord.js');
const mongo = require("../../mongo");
const muteTimeoutSchema = require('../../schemas/database_logs/mute_timeout_schema');
const path = require('path');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(newMember, oldMember, client, Discord) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);

        // Timeout logs
        if (oldMember.communicationDisabledUntilTimestamp > new Date().getTime()) {
            const fetchedLogs = await guild.fetchAuditLogs({
                limit: 1,
                action: 'MEMBER_UPDATE'
            });

            const muteLog = fetchedLogs.entries.first();
            const { executor, reason } = muteLog;            
            const toReason = reason || `None`;
            const timestamp = new Date().getTime();

            // Log to database for dashboard
            await mongo().then(async mongoose => {
                await muteTimeoutSchema.create({
                    userId: oldMember?.user.id,
                    username: oldMember?.user.tag,
                    author: executor?.id,
                    authorTag: `${executor?.username}#${executor?.discriminator}`,
                    reason: toReason,
                    timestamp: timestamp,
                    type: 'Timeout'
                });
            });
        }
    }
}



