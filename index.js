import dotenv from 'dotenv';
dotenv.config();
import Discord from 'discord.js';
import consoleStamp from 'console-stamp';
import commandHandler from './handlers/client/command_handler.js';
import eventHandler from './handlers/client/event_handler.js';

const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.GuildModeration,
        Discord.GatewayIntentBits.GuildWebhooks,
        Discord.GatewayIntentBits.GuildInvites,
        Discord.GatewayIntentBits.GuildPresences,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent
    ],
    partials: [
        Discord.Partials.Channel
    ]
});

console.time('Time to online');
consoleStamp(console, {
    format: ':date(dd mmmm yyyy HH:MM:ss) :label'
});

client.setMaxListeners(20);
client.commands = new Discord.Collection();
client.events = new Discord.Collection();

const handlers = [commandHandler, eventHandler];

handlers.forEach(handler => {
    handler(client, Discord);
});

client.login(process.env.BOT_TOKEN);