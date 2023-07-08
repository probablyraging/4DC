const { ActivityType } = require('discord.js');
const bumpCheck = require('../../modules/misc/bump_check');
const mutesCheck = require('../../modules/moderation/expired_mutes');
const databaseCleanup = require('../../modules/misc/cronjobs');
const liveNow = require('../../modules/automation/live_now');
const youtubeAuto = require('../../modules/misc/youtubeauto');
const welcomeCheck = require('../../modules/automation/welcome_message');
const cronjob = require('cron').CronJob;
const mongoose = require('mongoose');
const Canvas = require("canvas");
const path = require('path');

module.exports = {
    name: 'ready',
    once: true,
    async execute(message, client, Discord) {
        console.log('Client is online!');
        console.timeEnd('Time to online');

        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const generalChan = client.channels.cache.get(process.env.GENERAL_CHAN);

        // Connect to database
        mongoose.set('strictQuery', true); // Remove dep warning
        mongoose.connect(process.env.DB_PATH, { useNewUrlParser: true, useUnifiedTopology: true })
            .catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err))
            .then(() => console.log('Connected to database'));

        // Set client activity
        client.user.setActivity(`${new Intl.NumberFormat().format(guild.memberCount)} users`, { type: ActivityType.Watching });
        setInterval(() => {
            client.user.setActivity(`${new Intl.NumberFormat().format(guild.memberCount)} users`, { type: ActivityType.Watching });
        }, 900000);

        // Register the font we use for the /rank command
        Canvas.registerFont("./res/fonts/ulm_grotesk.ttf", { family: "grotesk" });
        Canvas.registerFont("./res/fonts/redhatdisplay_black.otf", { family: "redhatdisplay" });

        // Booster rewards
        const boostTimer = new cronjob('0 */10 * * *', function () {
            generalChan.createWebhook({ name: client.user.username, avatar: client.user.avatarURL({ format: 'png', size: 256 }) }).then(async webhook => {
                whMessage = await webhook.send({
                    content: `Boost the server and unlock these server benefits and more`,
                    files: ['./res/images/supporter_rewards.png']
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err));
                setTimeout(() => {
                    webhook.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook: `, err));
                }, 10000);
                setTimeout(async () => {
                    whMessage.delete();
                }, 300000);
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err));
        });
        boostTimer.start();

        // Misc intervals
        mutesCheck(message, client, Discord);
        bumpCheck(message, client, Discord);
        databaseCleanup(client);
        liveNow(client);
        youtubeAuto(client);
        welcomeCheck(client);
    }
};