const rankSchema = require('../../schemas/misc/rank_schema');
const warnSchema = require('../../schemas/misc/warn_schema');
const lastLetterSchema = require('../../schemas/letter_game/letter_lb_schema');
const countingSchema = require('../../schemas/counting_game/counting_schema');
const tokensSchema = require('../../schemas/misc/tokens_schema');
const inviteSchema = require('../../schemas/misc/invite_schema');
const cronjob = require('cron').CronJob;
const path = require('path');

module.exports = async (client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    // Fetch all rank entries sorted in descending order based on their 'xp', remove non-existent users and assign their new rank position - runs once per day (12:00)
    const rankSort = new cronjob('0 12 * * *', async function () {
        const results = await rankSchema.find().sort({ xp: -1 });
        let currentPosition = 0;
        let newPositionArr = [];
        for (const data of results) {
            const { id } = data;
            // Remove non-existent users from the database
            currentPosition++;
            const exists = await guild.members.fetch(id).catch(() => console.log(`Found and removed a user in the rank system that no longer exists`));
            if (!exists) {
                await rankSchema.deleteOne({ id: id })
                    .catch(err => console.error(`${path.basename(__filename)} There was a problem removing a database entry: `, err));
            }
            // Set each user's current rank position
            newPositionArr.push({ pos: currentPosition, id: id });
        }
        // Assign the new rank position to each user
        for (let i = 0; i < newPositionArr.length; i++) {
            await rankSchema.updateOne({
                id: newPositionArr[i].id
            }, {
                rank: newPositionArr[i].pos
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
        }
    });

    // Fetch all warnings and remove non-existent users - runs once per week (Monday 00:00)
    const warnsCheck = new cronjob('0 0 * * 1', async function () {
        const results = await warnSchema.find();
        for (const data of results) {
            const { userId } = data;
            const exists = await guild.members.fetch(userId).catch(() => console.log(`Found and removed a user in the warning system that no longer exists`));
            if (!exists) {
                await warnSchema.deleteOne({ userId: userId })
                    .catch(err => console.error(`${path.basename(__filename)} There was a problem removing a database entry: `, err));
            }
        }
    });

    // Fetch all last letter entries and remove non-existent users - runs once per week (Tuesday 00:00)
    const lastLetterCheck = new cronjob('0 0 * * 2', async function () {
        const results = await lastLetterSchema.find();
        for (const data of results) {
            const { userId } = data;
            const exists = await guild.members.fetch(userId).catch(() => console.log(`Found and removed a user in the last letter collection that no longer exists`));
            if (!exists) {
                await lastLetterSchema.deleteOne({ userId: userId })
                    .catch(err => console.error(`${path.basename(__filename)} There was a problem removing a database entry: `, err));
            }
        }
    });

    // Fetch all counting game entries and remove non-existent users - runs once per week (Wednesday 00:00)
    const countingCheck = new cronjob('0 0 * * 3', async function () {
        const results = await countingSchema.find();
        for (const data of results) {
            const { userId } = data;
            const exists = await guild.members.fetch(userId).catch(() => console.log(`Found and removed a user in the counting collection that no longer exists`));
            if (!exists) {
                await countingSchema.deleteOne({ userId: userId })
                    .catch(err => console.error(`${path.basename(__filename)} There was a problem removing a database entry: `, err));
            }
        }
    });

    // Reset all daily token caps - runs once per day (00:00)
    const tokenReset = new cronjob('0 0 * * *', async function () {
        const results = await tokensSchema.find();
        for (const data of results) {
            const { userId, availableAward } = data;
            const exists = await guild.members.fetch(userId).catch(() => console.log(`Found and removed a user in the tokens collection that no longer exists`));
            if (!exists) {
                await countingSchema.deleteOne({ userId: userId })
                    .catch(err => console.error(`${path.basename(__filename)} There was a problem removing a database entry: `, err));
            }
            // Reset staff available award
            if (availableAward === false) {
                await tokensSchema.updateOne({
                    userId: userId
                }, {
                    availableAward: true
                }, {
                    upsert: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
            }
            // Reset all user's token cap
            await tokensSchema.updateOne({
                userId: userId
            }, {
                dailyTokens: 0
            }, {
                upsert: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
        }
    });

    // Check for expired premium ads and send a notification
    const premiumAdsCheck = new cronjob('0 */6 * * *', async function () {
        const testChan = guild.channels.cache.get(process.env.TEST_CHAN);
        const premiumChan = await guild.channels.fetch('907446635435540551');
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
            if (!invitesArr.includes(code)) {
                await inviteSchema.deleteOne({ code: code })
                    .catch(err => console.error(`${path.basename(__filename)} There was a problem removing a database entry: `, err));
            }
        }
    });

    rankSort.start();
    warnsCheck.start();
    lastLetterCheck.start();
    countingCheck.start();
    tokenReset.start();
    premiumAdsCheck.start();
    invitesCheck.start();
}