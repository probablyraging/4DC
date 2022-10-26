console.time('Time to online');
require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client({
    intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMembers, Discord.GatewayIntentBits.GuildBans, Discord.GatewayIntentBits.GuildWebhooks, Discord.GatewayIntentBits.GuildInvites, Discord.GatewayIntentBits.GuildVoiceStates, Discord.GatewayIntentBits.GuildPresences, Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.GuildMessageReactions, Discord.GatewayIntentBits.DirectMessages, Discord.GatewayIntentBits.MessageContent], partials: [Discord.Partials.Channel],
    sweepers: {
        messages: {
			interval: 1200,
			lifetime: 1100
		}
    }
});

require('console-stamp')(console, {
    format: ':date(yyyy-mm-dd HH:MM:ss.l Z,true) :label'
});

client.setMaxListeners(0);
client.commands = new Discord.Collection();
client.events = new Discord.Collection();

["command_handler", "event_handler"].forEach(handler => {
    require(`./handlers/${handler}`)(client, Discord);
});

client.login(process.env.BOT_TOKEN);