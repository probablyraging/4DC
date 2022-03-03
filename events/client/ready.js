const mongo = require('../../mongo');
const cronjob = require('cron').CronJob;
const moment = require('moment');
const date = new Date();
const path = require('path');
const Canvas = require("canvas");
const memberCounter = require('../../modules/misc/member_counter');
const statusCounter = require('../../modules/misc/status_counter');
const ckqCheck = require('../../modules/bump_ckq/ckq_check');
const bumpCheck = require('../../modules/bump_ckq/bump_check');
const liveNow = require('../../modules/misc/live_now');
const fetchInvites = require('../../modules/misc/upload_invites');
const mutesCheck = require('../../modules/misc/mutes_check');
const autoYT = require('../../modules/misc/auto_yt');
const rankSort = require('../../modules/rank/rank_sort');
const { checkPreviousModsChoiceMessages, setupModsChoiceChecks } = require('../../modules/mods_choice/mods_choice_checks');

module.exports = {
    name: 'ready',
    once: true,
    async execute(message, client, Discord) {
        console.log(`\x1b[36m%s\x1b[0m`, `${moment(date).format('D MMM YYYY hh:mm')}`, `Client is online!`);

        await mongo().then(mongoose => {
            try {
                console.log(`\x1b[36m%s\x1b[0m`, `${moment(date).format('D MMM YYYY hh:mm')}`, 'Connected to database');
            } catch (err) {
                console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err);
            }
        });

        // Register the font we use for the /rank command
        Canvas.registerFont("./res/fonts/ulm_grotesk.ttf", { family: "grotesk" });

        // Fetch messages in #self-roles to listen for messageReactionAdd/Remove - this adds them to the cache
        const reactChannel = client.channels.cache.get(process.env.SELFROLE_CHAN);
        reactChannel.messages.fetch();

        await checkPreviousModsChoiceMessages(client);

        const img = 'https://www.weebly.com/editor/uploads/1/2/6/0/126006118/custom_themes/656977109613806662/files/images/CHBoostRewards.png';
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

        boostTimer.start();
        mutesCheck(message, client, Discord);
        fetchInvites(message, client, Discord);
        statusCounter(client);
        memberCounter(client);
        ckqCheck(client);
        bumpCheck(message, client, Discord);
        liveNow(client);
        autoYT(client);
        rankSort(client);
        setupModsChoiceChecks(client);
    }
};
