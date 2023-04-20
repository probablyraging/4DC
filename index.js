require("dotenv").config();
const Discord = require('discord.js');
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.AutoModerationConfiguration
    ],
    partials: [
        Partials.Channel
    ],
});

console.time('Time to online');
require('console-stamp')(console, {
    format: ':date(dd mmmm yyyy HH:MM:ss) :label'
});

client.setMaxListeners(0);
client.commands = new Collection();
client.events = new Collection();

["command_handler", "event_handler"].forEach(handler => {
    require(`./handlers/client/${handler}`)(client, Discord);
});

client.login(process.env.BOT_TOKEN);