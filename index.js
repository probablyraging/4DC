require("dotenv").config();
const Discord = require("discord.js");
const Canvas = require("canvas");
const client = new Discord.Client({partials: ["CHANNEL"], intents: 32767});

client.setMaxListeners(0);
client.commands = new Discord.Collection();
client.events = new Discord.Collection();

["command_handler", "event_handler"].forEach(handler => {
    require(`./handlers/${handler}`)(client, Discord);
});

// Register the font we use for the /rank command
Canvas.registerFont("./res/fonts/ulm_grotesk.ttf", {family: "grotesk"});

client.login(process.env.BOT_TOKEN);
