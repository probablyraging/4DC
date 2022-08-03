const rankSchema = require('../../schemas/misc/rank_schema');
const cronjob = require('cron').CronJob;
const path = require('path');

module.exports = async (client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    const rankSort = new cronjob('0 0 * * *', async function () {
        // find all entries, sort them in descending order based on their 'xp'
        const sort = await rankSchema.find().catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));

        sortArr = [];
        for (const data of sort) {
            const { id, xp } = data;

            sortArr.push({ id, xp });
        }

        sortArr.sort(function (a, b) {
            return b.xp - a.xp;
        });

        // remove non-existent users from the database
        for (var i = 0; i < sortArr.length; i++) {
            const exists = await guild.members.fetch(sortArr[i].id)
                .catch(() => console.log(`Found and removed a user in the rank system that no longer exists`));

            if (!exists) {
                await rankSchema.findOneAndRemove({ id: sortArr[i].id })
                    .catch(err => console.error(`${path.basename(__filename)} There was a problem removing a database entry: `, err));
            }
        }

        // get each user's current rank position
        rankPosArr = [];
        for (let i = 0; i < sortArr.length; i++) {
            await rankPosArr.push({ pos: i + 1, id: sortArr[i].id, xp: sortArr[i].xp });
        }

        // assign the new rank position to each user
        for (var i = 0; i < rankPosArr.length; i++) {
            await rankSchema.updateOne({
                id: rankPosArr[i].id
            }, {
                rank: rankPosArr[i].pos
            }, {
                upsert: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
        }
    });

    rankSort.start();
}