require("dotenv").config();
const Discord = require('discord.js');
const { Client, GatewayIntentBits, Partials, Options, Collection } = require('discord.js');
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
    makeCache: Options.cacheWithLimits({
        ...Options.DefaultMakeCacheSettings,
        AutoModerationRuleManager: 0,
        ReactionManager: 0,
        GuildBanManager: 0,
        GuildStickerManager: 0,
        ReactionUserManager: 0,
        StageInstanceManager: 0,
        ThreadMemberManager: 0,
        VoiceStateManager: 0,
    }),
    sweepers: {
        ...Options.DefaultSweeperSettings,
        messages: {
            interval: 3600,
            lifetime: 3600,
        },
        threads : {
            interval: 3600,
            lifetime: 3600
        }
    }
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