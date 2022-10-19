const { ActivityType } = require('discord.js');

module.exports = async (client) => {
    setInterval(() => {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        client.user.setActivity(`${numberWithCommas(guild.memberCount)} users`, { type: ActivityType.Watching });
    }, 900000);
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}