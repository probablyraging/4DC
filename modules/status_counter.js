module.exports = (client, Discord) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    setInterval(() => {
        client.user.setActivity(`${guild.memberCount} users`, { type: 'WATCHING' });
    }, 600000);

}