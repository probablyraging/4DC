const { EmbedBuilder } = require('discord.js');
const { logToChartData } = require('../../modules/dashboard/log_to_database');
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
        logToChartData('leaves');
    }
}