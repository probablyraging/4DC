const { ActivityType } = require('discord.js');
const bumpCheck = require('../../modules/misc/bump_check');
const mutesCheck = require('../../modules/moderation/expired_mutes');
const databaseCleanup = require('../../modules/misc/cronjobs');
const liveNow = require('../../modules/automation/live_now');
const youtubeAuto = require('../../modules/misc/youtubeauto');
const fetchTweets = require('../../modules/automation/fetch_tweets');
const welcomeCheck = require('../../modules/automation/welcome_message');
const mongoose = require('mongoose');
const Canvas = require("canvas");
const path = require('path');

module.exports = {
    name: 'ready',
    once: true,
    async execute(message, client, Discord) {
        console.log('Client is online!');
        console.timeEnd('Time to online');

        // Connect to database
        mongoose.set('strictQuery', true); // Remove dep warning
        mongoose.connect(process.env.DB_PATH, { useNewUrlParser: true, useUnifiedTopology: true })
            .catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err))
            .then(() => console.log('Connected to database'));

        // Set client activity
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        client.user.setActivity(`${new Intl.NumberFormat().format(guild.memberCount)} users`, { type: ActivityType.Watching });
        setInterval(() => {
            client.user.setActivity(`${new Intl.NumberFormat().format(guild.memberCount)} users`, { type: ActivityType.Watching });
        }, 900000);

        // Register the font we use for the /rank command
        Canvas.registerFont("./res/fonts/ulm_grotesk.ttf", { family: "grotesk" });
        Canvas.registerFont("./res/fonts/redhatdisplay_black.otf", { family: "redhatdisplay" });

        // Misc intervals
        mutesCheck(message, client, Discord);
        bumpCheck(message, client, Discord);
        databaseCleanup(client);
        liveNow(client);
        youtubeAuto(client);
        fetchTweets(client);
        welcomeCheck(client);
    }
};