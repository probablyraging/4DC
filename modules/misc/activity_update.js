const { ActivityType } = require('discord.js');

module.exports = (client) => {
    client.user.setActivity('/help', { type: ActivityType.Streaming, url: 'https://www.twitch.tv/probablyraging' });
}