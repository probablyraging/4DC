import dotenv from 'dotenv';
dotenv.config();
import Discord from 'discord.js';
import consoleStamp from 'console-stamp';

const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.GuildModeration,
        Discord.GatewayIntentBits.GuildWebhooks,
        Discord.GatewayIntentBits.GuildInvites,
        Discord.GatewayIntentBits.GuildPresences,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
    ],
    partials: [
        Discord.Partials.Channel,
    ],
});

console.time('Time to online');
consoleStamp(console, {
    format: ':date(dd mmmm yyyy HH:MM:ss) :label',
});

client.commands = new Discord.Collection();
client.events = new Discord.Collection();

['command_handler', 'event_handler'].forEach(async (handler) => {
    await import(`./handlers/client/${handler}.js`)
        .then(module => { module.default(client, Discord); });
});

client.login(process.env.BOT_TOKEN);