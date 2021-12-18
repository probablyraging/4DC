require('dotenv').config();
const moment = require('moment');
const date = new Date();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

module.exports = {
    name: 'ready',
    once: true,
    execute(client, commands) {
        console.log(`\x1b[36m%s\x1b[0m`, `${moment(date).format('D MMM YYYY hh:mm')}`, `CreatorBot online!`);

        const CLIENT_ID = client.user.id;
        const rest = new REST({
            version: '9'
        }).setToken(process.env.BOT_TOKEN);

        (async () => {
            try {
                if (process.env.ENV === 'production') {
                    await rest.put(Routes.applicationCommands(CLIENT_ID), {
                        body: commands
                    });
                    console.log('Commands registered globally!');
                } else {
                    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, process.env.GUILD_ID), {
                        body: commands
                    });
                    console.log('Commands registered locally!');
                }
            } catch (err) {
                if (err) console.log(err)
            }
        })();
    }
}
