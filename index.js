require('dotenv').config();
const fs = require('fs');
const moment = require('moment');
const date = new Date();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const Discord = require('discord.js')
const { Intents, Collection } = require('discord.js');
const client = new Discord.Client({ partials: ['CHANNEL'], intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_WEBHOOKS, Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGE_TYPING] });

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const commands = [];

client.commands = new Collection();

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
}

client.once('ready', () => {

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
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (err) {
        if (err) console.log(err)

        await interaction.reply({ 
            content: `Error`,
            ephemeral: true
        })
    }
});

client.login(process.env.BOT_TOKEN);