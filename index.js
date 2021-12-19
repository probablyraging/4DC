require('dotenv').config();
const fs = require('fs');
const Discord = require('discord.js')
const { Intents, Collection } = require('discord.js');
const client = new Discord.Client({ partials: ['CHANNEL'], intents: 32767 });

client.setMaxListeners(0);
client.commands =  new Discord.Collection();

['command_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`)(client);
})

client.login(process.env.BOT_TOKEN);