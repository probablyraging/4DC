const mongo = require('../../mongo');
const cronjob = require('cron').CronJob;
const moment = require('moment');
const date = new Date();
const path = require('path');
const memberCounter = require('../../modules/member_counter');
const statusCounter = require('../../modules/status_counter');
const ckqCheck = require('../../modules/ckq_check');
const bumpCheck = require('../../modules/bump_check');
const liveNow = require('../../modules/live_now');
const fetchInvites = require('../../modules/upload_invites');
const mutesCheck = require('../../modules/mutes_check');

module.exports = {
    name: 'ready',
    once: true,
    async execute(message, client, Discord) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);

        client.user.setActivity('/help', { type: 'STREAMING', url: 'https://www.twitch.tv/probablyraging' });

        setInterval(() => {
            client.user.setActivity(`${guild.memberCount} users`, { type: 'WATCHING' });
        }, 120000);

        setInterval(() => {
            client.user.setActivity('/help', { type: 'STREAMING', url: 'https://www.twitch.tv/probablyraging' });
        }, 90000);

        console.log(`\x1b[36m%s\x1b[0m`, `${moment(date).format('D MMM YYYY hh:mm')}`, `Client is online!`);

        await mongo().then(mongoose => {
            try {
                console.log(`\x1b[36m%s\x1b[0m`, `${moment(date).format('D MMM YYYY hh:mm')}`, 'Connected to database');
            } finally {
                // do nothing
            }
        });
        // // Fetch messages in #self-roles to listen for messageReactionAdd/Remove - this adds them to the cache
        const reactChannel = client.channels.cache.get(process.env.SELFROLE_CHAN);
        reactChannel.messages.fetch();

        // // fetch messages in #last-letter to get the most recent message's content
        // const llChan = client.channels.cache.get(process.env.LL_CHAN);
        // llChan.messages.fetch({ limit: 3 });

        mutesCheck(message, client, Discord);
        fetchInvites(message, client, Discord);
        statusCounter(client);
        memberCounter(client);
        ckqCheck(message, client, Discord);
        bumpCheck(message, client, Discord);
        liveNow(message, client, Discord);

        let img = 'https://www.weebly.com/editor/uploads/1/2/6/0/126006118/custom_themes/656977109613806662/files/images/CHBoostRewards.png';
        const boostTimer = new cronjob('0 */10 * * *', function () {
            client.channels.cache.get(process.env.GENERAL_CHAN)
                .send({
                    files: [img]
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err))
                .then(msg => {
                    setTimeout(() => {
                        msg.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err))
                    }, 900000);
                })
        });

        boostTimer.start();
    }
};
