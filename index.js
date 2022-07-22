require("dotenv").config();
const Discord = require("discord.js");
// const client = new Discord.Client({ partials: ["CHANNEL"], intents: 32767 });
const client = new Discord.Client({ intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMembers, Discord.GatewayIntentBits.GuildBans, Discord.GatewayIntentBits.GuildEmojisAndStickers, Discord.GatewayIntentBits.GuildIntegrations, Discord.GatewayIntentBits.GuildWebhooks, Discord.GatewayIntentBits.GuildInvites, Discord.GatewayIntentBits.GuildVoiceStates, Discord.GatewayIntentBits.GuildPresences, Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.GuildMessageReactions, Discord.GatewayIntentBits.GuildMessageTyping, Discord.GatewayIntentBits.DirectMessages, Discord.GatewayIntentBits.DirectMessageReactions, Discord.GatewayIntentBits.DirectMessageTyping, Discord.GatewayIntentBits.MessageContent, Discord.GatewayIntentBits.GuildScheduledEvents], partials: [Discord.Partials.Channel] });

require('console-stamp')(console, {
    format: ':date(yyyy-mm-dd HH:MM:ss.l Z,true) :label'
});

client.setMaxListeners(0);
// client.application.commands = new Discord.Collection();
client.commands = new Discord.Collection();
client.events = new Discord.Collection();

// console.log(client.commands)

["command_handler", "event_handler"].forEach(handler => {
    require(`./handlers/${handler}`)(client, Discord);
});

client.login(process.env.BOT_TOKEN);