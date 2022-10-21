const { checkPreviousPosts, setupChecks } = require('../../modules/creator_crew/check_previous_posts');
const statusCounter = require('../../modules/misc/activity_update');
const ckqCheck = require('../../modules/bump_ckq/ckq_check');
const bumpCheck = require('../../modules/bump_ckq/bump_check');
const featuredCheck = require('../../modules/bump_ckq/featured_check');
const liveNow = require('../../modules/misc/live_now');
const mutesCheck = require('../../modules/misc/mutes_check');
const autoYT = require('../../modules/misc/auto_yt');
const rankSort = require('../../modules/rank/rank_sort');
const cronjob = require('cron').CronJob;
const mongo = require('../../mongo');
const Canvas = require("canvas");
const path = require('path');

module.exports = {
    name: 'ready',
    once: true,
    async execute(message, client, Discord) {
        console.log('Client is online!');

        await mongo().then(mongoose => {
            try {
                console.log('Connected to database');
            } catch (err) {
                console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err);
            }
        });

        // Register the font we use for the /rank command
        Canvas.registerFont("./res/fonts/ulm_grotesk.ttf", { family: "grotesk" });

        // Creator Crew previous post check
        await checkPreviousPosts(client);

        // Booster rewards
        const img = 'https://www.forthecontent.xyz/images/creatorhub/booster_rewards.png';
        const boostTimer = new cronjob('0 */10 * * *', function () {
            client.channels.cache.get(process.env.GENERAL_CHAN)
                .send({
                    files: [img]
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err))
                .then(msg => {
                    setTimeout(() => {
                        msg.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err))
                    }, 900000);
                });
        });

        // Misc intervals
        boostTimer.start();
        mutesCheck(message, client, Discord);
        statusCounter(client);
        ckqCheck(client);
        bumpCheck(message, client, Discord);
        featuredCheck(client);
        liveNow(client);
        autoYT(client);
        rankSort(client);
        setupChecks(client);

        console.timeEnd('Time to online');
    }
};