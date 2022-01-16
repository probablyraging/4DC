module.exports = (client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    client.user.setActivity('/help', { type: 'STREAMING', url: 'https://www.twitch.tv/probablyraging' });

    setInterval(() => {
        client.user.setActivity(`${guild.memberCount} users`, { type: 'WATCHING' });
    }, 120000);

    setInterval(() => {
        client.user.setActivity('/help', { type: 'STREAMING', url: 'https://www.twitch.tv/probablyraging' });
    }, 90000);

}