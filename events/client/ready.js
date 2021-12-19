const { client } = require('discord.js');
const moment = require('moment');
const date = new Date();

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);

        client.user.setActivity(`${guild.memberCount} users`, { type: 'WATCHING' });

        console.log(`\x1b[36m%s\x1b[0m`, `${moment(date).format('D MMM YYYY hh:mm')}`, `Client is online!`);
    }
}
