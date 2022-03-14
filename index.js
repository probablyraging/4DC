require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client({ partials: ["CHANNEL"], intents: 32767 });
require('console-stamp')(console, {
    format: ':date(yyyy-mm-dd HH:MM:ss.l Z) :label',
    utc: true
});

client.setMaxListeners(0);
client.commands = new Discord.Collection();
client.events = new Discord.Collection();

["command_handler", "event_handler"].forEach(handler => {
    require(`./handlers/${handler}`)(client, Discord);
});

client.login(process.env.BOT_TOKEN);