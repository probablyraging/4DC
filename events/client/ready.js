const { client } = require('discord.js');
const memberCounter = require('../../modules/member_counter');
const { mongoose } = require('mongoose');
const mongo = require('../../mongo');
const moment = require('moment');
const date = new Date();
const statusCounter = require('../../modules/status_counter');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);

        client.user.setActivity(`${guild.memberCount} users`, { type: 'WATCHING' });

        statusCounter(client);
        memberCounter(client);

        console.log(`\x1b[36m%s\x1b[0m`, `${moment(date).format('D MMM YYYY hh:mm')}`, `Client is online!`);

        await mongo().then(mongoose => {
            try {
                console.log(`\x1b[36m%s\x1b[0m`, `${moment(date).format('D MMM YYYY hh:mm')}`, 'Connected to database')
            } finally {
                return;
            }
        });
    }
};
