const rankSchema = require('../../schemas/misc/rank_schema');
const warnSchema = require('../../schemas/misc/warn_schema');
const lastLetterSchema = require('../../schemas/letter_game/letter_lb_schema');
const countingSchema = require('../../schemas/counting_game/counting_schema');
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
        const exists = await guild.members.fetch(userId).catch(() => console.log(`Found and removed a user in the warning system that no longer exists`));
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
            const exists = await guild.members.fetch(userId).catch(() => console.log(`Found and removed a user in the warning system that no longer exists`));
            if (!exists) {
                await countingSchema.deleteOne({ userId: userId })
                    .catch(err => console.error(`${path.basename(__filename)} There was a problem removing a database entry: `, err));
            }
        }
    });

    rankSort.start();
    warnsCheck.start();
    lastLetterCheck.start();
    countingCheck.start();
}