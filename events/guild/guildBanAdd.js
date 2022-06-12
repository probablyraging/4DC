const { MessageEmbed } = require('discord.js');
const mongo = require("../../mongo");
const banUnbanSchema = require('../../schemas/database_logs/ban_unban_schema');
const chartData = require('../../schemas/database_logs/chart_data');
const path = require('path');

module.exports = {
    name: 'guildBanAdd',
    async execute(ban, client, Discord) {
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

        // Database charts
        const nowTimestamp = new Date().valueOf();
        const tsToDate = new Date(nowTimestamp);
        const months = ["Jan", "Fab", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const dateToUTC = tsToDate.getUTCDate() + ' ' + months[tsToDate.getUTCMonth()] + ' ' + tsToDate.getUTCFullYear();

        const results = await chartData.find({ date: dateToUTC });

        if (results.length === 0) {
            await chartData.create({
                date: dateToUTC,
                joins: '0',
                leaves: '0',
                bans: '1',
                messages: '0'
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem creating a database entry: `, err));
        } else {
            for (const data of results) {
                const { bans } = data;
                currentBans = bans;
                currentBans++;
                await chartData.findOneAndUpdate({
                    date: dateToUTC
                }, {
                    bans: currentBans.toString()
                }, {
                    upsert: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
            }
        }
    }
}