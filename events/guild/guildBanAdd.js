const { MessageEmbed } = require('discord.js');
const mongo = require("../../mongo");
const banUnbanSchema = require('../../schemas/database_logs/ban_unban_schema');
const path = require('path');

module.exports = {
    name: 'guildBanAdd',
    execute(ban, client, Discord) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const timestamp = new Date().getTime();

        setTimeout(async () => {
            const fetchedLogs = await guild.fetchAuditLogs({
                limit: 1,
                type: 'MEMBER_BAN_ADD',
            });

            const banLog = fetchedLogs.entries.first();
            const { executor, reason } = banLog;

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