import { dbUpdateOne, dbDeleteOne } from '../../utils/utils.js';
import rankSchema from '../../schemas/rank_schema.js';
import warnSchema from '../../schemas/warn_schema.js';
import inviteSchema from '../../schemas/invite_schema.js';
import timerSchema from '../../schemas/timer_schema.js';
import { CronJob } from 'cron';
import axios from 'axios';

export default async (client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    // Fetch all rank entries sorted in descending order based on their 'xp', remove non-existent users and assign their new rank position - runs once per day (12:00)
    const rankSort = new CronJob('0 12 * * *', async function () {
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
    const warnsCheck = new CronJob('0 0 1 * *', async function () {
        const results = await warnSchema.find();
        for (const data of results) {
            const { userId } = data;
            const exists = await guild.members.fetch(userId).catch(() => console.log(`Found and removed a user in the warning system that no longer exists`));
            if (!exists) await dbDeleteOne(warnSchema, { userId: userId });
        }
    });

    // Check for expired premium ads and send a notification
    const premiumAdsCheck = new CronJob('0 */6 * * *', async function () {
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
                    }).catch(err => console.error(`There was a problem sending a message: `, err));
                }
            }
        });
    });

    // Check for invite codes that no longer exist - runs once per week (Thursday 00:00)
    const invitesCheck = new CronJob('0 0 * * 4', async function () {
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
    const pauseDMs = new CronJob('0 9 * * *', async function () {
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
            .catch(err => console.error(`There was a problem making a PUT request: `, err));
        await dbUpdateOne(timerSchema, { timer: 'dms' }, { timestamp: expireTimestamp });
    });

    // Delete abandoned service threads
    const deleteAbandonedServiceThreads = new CronJob('0 1 * * 2', async function () {
        const threadChan = await guild.channels.fetch('1096198410664689744');
        const threads = threadChan.threads.cache;
        threads.forEach(async thread => {
            const exists = await guild.members.fetch(thread.ownerId).catch(() => { console.log(`Found and removed an abandoned service thread`) });
            if (!exists) thread.delete().catch(err => console.error(`There was a problem deleting an abandoned service thread: `, err));
        });
    });

    // Archive abandoned LFS thresds
    const deleteAbandonedLFSThreads = new CronJob('0 1 * * 2', async function () {
        const threadChan = await guild.channels.fetch('978694637088804884');
        const threads = threadChan.threads.cache;
        threads.forEach(async thread => {
            const exists = await guild.members.fetch(thread.ownerId).catch(() => { });
            if (!exists) {
                try {
                    await thread.setLocked(true);
                    await thread.setArchived(true);
                    console.log(`Found and removed an abandoned LFS thread`);
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