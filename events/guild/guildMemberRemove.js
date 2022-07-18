const { EmbedBuilder } = require('discord.js');
const chartData = require('../../schemas/database_logs/chart_data');
const path = require('path');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member, client, Discord) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const joinLeaveChan = client.channels.cache.get(process.env.JOINLEAVE_CHAN);

        // Joins/leaves log channel
        joinLeaveChan.send({
            content: `${process.env.BOT_LEAVE} ${member} left. There are now **${guild.memberCount}** members in the server`
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

        // Database charts
        const nowTimestamp = new Date().valueOf();
        const tsToDate = new Date(nowTimestamp);
        const months = ["Jan", "Fab", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const dateToUTC = tsToDate.getUTCDate() + ' ' + months[tsToDate.getUTCMonth()] + ' ' + tsToDate.getUTCFullYear();
        const results = await chartData.find({ date: dateToUTC });
        const oneDay = 24 * 60 * 60 * 1000;
        const joinedTimestamp = member.joinedTimestamp;

        // Don't log members who join and instantly leave
        if ((new Date() - joinedTimestamp) > oneDay) {
            if (results.length === 0) {
                await chartData.create({
                    date: dateToUTC,
                    joins: '0',
                    leaves: '1',
                    bans: '0',
                    messages: '0'
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem creating a database entry: `, err));
            } else {
                for (const data of results) {
                    const { leaves } = data;
                    currentLeaves = leaves;
                    currentLeaves++;
                    await chartData.findOneAndUpdate({
                        date: dateToUTC
                    }, {
                        leaves: currentLeaves.toString()
                    }, {
                        upsert: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
                }
            }
        }
    }
}