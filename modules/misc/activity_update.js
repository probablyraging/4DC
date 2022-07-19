const { ActivityType } = require('discord.js');

module.exports = (client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    client.user.setActivity('/help', { type: ActivityType.Streaming, url: 'https://www.twitch.tv/probablyraging' });
}