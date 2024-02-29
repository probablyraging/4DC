const { dbUpdateOne, dbDeleteOne } = require('../../utils/utils');
const rankSchema = require('../../schemas/rank_schema');
const warnSchema = require('../../schemas/warn_schema');
const inviteSchema = require('../../schemas/invite_schema');
const timerSchema = require("../../schemas/timer_schema");
const cronjob = require('cron').CronJob;
const { default: axios } = require('axios');
const path = require('path');

module.exports = async (client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    // Fetch all rank entries sorted in descending order based on their 'xp', remove non-existent users and assign their new rank position - runs once per day (12:00)
    const rankSort = new cronjob('0 12 * * *', async function () {
        const results = await rankSchema.find().sort({ xp: -1 });
        let currentPosition = 0;
        let newPositionArr = [];
        for (const data of results) {
            const { userId } = data;
            // Remove non-existent users from the database
            currentPosition++;
            const exists = await guild.members.fetch(userId).catch(() => console.log(`Found and removed a user in the rank system that no longer exists`));
            if (!exists) await dbDeleteOne(rankSchema, { userId: userId });
            // Set each user's current rank position
            newPositionArr.push({ pos: currentPosition, userId: userId });
        }
        // Assign the new rank position to each user
        for (let i = 0; i < newPositionArr.length; i++) {
            await dbUpdateOne(rankSchema, { userId: newPositionArr[i].userId }, { rank: newPositionArr[i].pos });
        }
    });

    // Fetch all warnings and remove non-existent users - runs once per month, on the first day of the month (Monday 00:00)
    const warnsCheck = new cronjob('0 0 1 * *', async function () {
        const results = await warnSchema.find();
        for (const data of results) {
            const { userId } = data;
            const exists = await guild.members.fetch(userId).catch(() => console.log(`Found and removed a user in the warning system that no longer exists`));
            if (!exists) await dbDeleteOne(warnSchema, { userId: userId });
        }
    });

    // Check for expired premium ads and send a notification
    const premiumAdsCheck = new cronjob('0 */6 * * *', async function () {
        const testChan = guild.channels.cache.get(process.env.TEST_CHAN);
        const premiumChan = await guild.channels.cache.get(process.env.PREM_CHAN);
        const premiumAds = await premiumChan.messages.fetch();

        premiumAds.forEach(message => {
            if (!message.author.bot) {
                let adLength;
                if (message.content.toLowerCase().split('\n')[0].includes('1 week')) adLength = 24 * 60 * 60 * 7 * 1000;
                if (message.content.toLowerCase().split('\n')[0].includes('1 month')) adLength = 24 * 60 * 60 * 28 * 1000;
                if (message.content.toLowerCase().split('\n')[0].includes('3 month')) adLength = 24 * 60 * 60 * 28 * 3 * 1000;
                if (message.content.toLowerCase().split('\n')[0].includes('6 month')) adLength = 24 * 60 * 60 * 28 * 6 * 1000;

                if ((new Date() - message.createdTimestamp) > adLength) {
                    testChan.send({
                        content: `<@${process.env.OWNER_ID}> A premium ad has expired - ${message.url}`
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                }
            }
        });
    });

    // Check for invite codes that no longer exist - runs once per week (Thursday 00:00)
    const invitesCheck = new cronjob('0 0 * * 4', async function () {
        const invites = await guild.invites.fetch();
        let invitesArr = [];
        invites.forEach(invite => {
            invitesArr.push(invite.code);
        });
        const results = await inviteSchema.find();
        for (const data of results) {
            const { code } = data;
            if (!invitesArr.includes(code)) await dbDeleteOne(inviteSchema, { code: code });
        }
    });

    // Pause DMs - runs once per day (09:00)
    const pauseDMs = new cronjob('0 9 * * *', async function () {
        const currentDate = new Date();
        currentDate.setHours(currentDate.getHours() + 24);
        const isoTimestamp = currentDate.toISOString();
        const expireTimestamp = currentDate.valueOf();
        const requestData = {
            "dms_disabled_until": isoTimestamp
        };
        const headers = {
            'Authorization': `Bot ${process.env.BOT_TOKEN}`,
            'Content-Type': 'application/json',
        };
        await axios.put('https://canary.discord.com/api/v9/guilds/820889004055855144/incident-actions', requestData, { headers })
            .catch(err => console.error(`${path.basename(__filename)} There was a problem making a PUT request: `, err));
        await dbUpdateOne(timerSchema, { timer: 'dms' }, { timestamp: expireTimestamp });
    });

    // Kick unverified users - runs ever 15 minutes
    const kickUnverifiedUsers = new cronjob('*/15 * * * *', async function () {
        const unverifiedRole = guild.roles.cache.get(process.env.UNVERIFIED_ROLE);
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        const fiveMinutes = 5 * 60 * 1000;
        unverifiedRole.members.forEach(member => {
            if ((new Date() - member.joinedTimestamp) < oneWeek && (new Date() - member.joinedTimestamp) > fiveMinutes) {
                member.kick('Did not verify in time').catch(err => console.error(`${path.basename(__filename)} There was a problem kicking a user from the server: `, err));
            }
        })
    });

    // Delete abandoned service threads
    const deleteAbandonedServiceThreads = new cronjob('0 1 * * 2', async function () {
        const threadChan = await guild.channels.fetch('1096198410664689744');
        const threads = threadChan.threads.cache;
        threads.forEach(async thread => {
            const exists = await guild.members.fetch(thread.ownerId).catch(() => { });
            if (!exists) thread.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting an abandoned service thread: `, err));
        });
    });

    // Archive abandoned LFS thresds
    const deleteAbandonedLFSThreads = new cronjob('0 1 * * 2', async function () {
        const threadChan = await guild.channels.fetch('978694637088804884');
        const threads = threadChan.threads.cache;
        threads.forEach(async thread => {
            const exists = await guild.members.fetch(thread.ownerId).catch(() => { });
            if (!exists) {
                try {
                    await thread.setLocked(true);
                    await thread.setArchived(true);
                } catch (err) {
                    console.error('There was a problem archiving an abandoned lfs thread: ', err);
                }
            }
        });
    });

    rankSort.start();
    warnsCheck.start();
    premiumAdsCheck.start();
    invitesCheck.start();
    pauseDMs.start();
    kickUnverifiedUsers.start();
    deleteAbandonedServiceThreads.start();
    deleteAbandonedLFSThreads.start();
}