const { ActivityType } = require('discord.js');

module.exports = async (client) => {
    const activityType = ActivityType.Watching;
    const guildId = process.env.GUILD_ID;
    const guild = client.guilds.cache.get(guildId);
    client.user.setActivity(`${new Intl.NumberFormat().format(guild.memberCount)} users`, { type: activityType });
    setInterval(() => {
        client.user.setActivity(`${new Intl.NumberFormat().format(guild.memberCount)} users`, { type: activityType });
    }, 900000);
};