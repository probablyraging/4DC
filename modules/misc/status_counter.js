const { ActivityType } = require('discord.js');

module.exports = (client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    client.user.setActivity('/help', { type: ActivityType.Streaming, url: 'https://www.twitch.tv/probablyraging' });

    setInterval(() => {
        client.user.setActivity(`${guild.memberCount} users`, { type: ActivityType.Watching });
    }, 120000);

    setInterval(() => {
        client.user.setActivity('/help', { type: ActivityType.Streaming, url: 'https://www.twitch.tv/probablyraging' });
    }, 90000);

}