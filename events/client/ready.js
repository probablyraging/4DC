import { ActivityType } from 'discord.js';
import bumpCheck from '../../modules/misc/bump_check.js';
import mutesCheck from '../../modules/moderation/expired_mutes.js';
import databaseCleanup from '../../modules/automation/cronjobs.js';
import youtubeAuto from '../../modules/automation/youtubeauto.js';
import { CronJob } from 'cron';
import mongoose from 'mongoose';
import Canvas from 'canvas';

export default {
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
            .catch(err => console.error('There was a problem connecting to the database: ', err))
            .then(() => console.log('Connected to database'));

        // Set client activity
        client.user.setActivity({ type: ActivityType.Custom, name: 'custom', state: `Moderating ${new Intl.NumberFormat().format(guild.memberCount)} users` });
        setInterval(() => {
            client.user.setActivity({ type: ActivityType.Custom, name: 'custom', state: `Moderating ${new Intl.NumberFormat().format(guild.memberCount)} users` });
        }, 900000);

        // Register the font we use for the /rank command
        Canvas.registerFont('./res/fonts/ulm_grotesk.ttf', { family: 'grotesk' });
        Canvas.registerFont('./res/fonts/redhatdisplay_black.otf', { family: 'redhatdisplay' });

        // Booster rewards
        const boostTimer = new CronJob('0 */10 * * *', function () {
            let whMessage;
            generalChan.createWebhook({ name: client.user.username, avatar: client.user.avatarURL({ format: 'png', size: 256 }) }).then(async webhook => {
                whMessage = await webhook.send({
                    content: 'Boost the server and unlock these server benefits and more',
                    files: ['./res/images/supporter_rewards.png'],
                }).catch(err => console.error('There was a problem sending a webhook message: ', err));
                setTimeout(() => {
                    webhook.delete().catch(err => console.error('There was a problem deleting a webhook: ', err));
                }, 10000);
                setTimeout(async () => {
                    whMessage.delete();
                }, 300000);
            }).catch(err => console.error('There was a problem sending a webhook: ', err));
        });
        boostTimer.start();

        // Misc intervals
        mutesCheck(message, client, Discord);
        bumpCheck(message, client, Discord);
        databaseCleanup(client);
        youtubeAuto(client);
    },
};