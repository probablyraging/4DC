const { Message } = require('discord.js');
const rankSchema = require('../../schemas/misc/rank_schema');
const path = require('path');
const xpLimit = new Set();
/**
 * 
 * @param {Message} message 
 */
module.exports = async (message, client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const botChan = guild.channels.cache.get(process.env.BOT_CHAN);

    const disableXP = [process.env.CONTENT_SHARE, process.env.BOT_CHAN]

    let results;
    if (!message?.author?.bot && !xpLimit.has(message?.author?.id)) {
        results = await rankSchema.find({ id: message?.author?.id }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
        // check to see if the user is in our database yet, if not, add them
        if (results.length === 0) {
            await rankSchema.create({
                rank: 0,
                id: message?.author?.id,
                username: message?.author.username,
                discrim: message?.author.discriminator,
                avatar: message?.author.avatar,
                level: 0,
                msgCount: 0,
                xp: 0,
                xxp: 0,
                xxxp: 100
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
        }

        // if the message is in an XP disabled channel, don't add XP
        if (disableXP.includes(message?.channel?.id)) return;

        // find all entries, sort them based on their 'xp' and assign each user a 'rank'
        const sort = await rankSchema.find().catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));

        sortArr = [];
        for (const data of sort) {
            const { id, xp } = data;

            sortArr.push({ id, xp });
        }

        sortArr.sort(function (a, b) {
            return b.xp - a.xp;
        });

        // get a random number between 15 and 25
        function randomNum(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        }

        for (const data of results) {
            let { xp, xxp, xxxp, level, msgCount } = data;

            let msgMath = parseInt(msgCount) + 1;
            let random = randomNum(15, 25) * 2;
            let xpMath = parseInt(xp) + random;
            let xxpMath = parseInt(xxp) + random;

            let xxpInt = parseInt(xxp);
            let xxxpInt = parseInt(xxxp);
            let newUsername = message?.author?.username;
            let newDiscrim = message?.author?.discriminator;

            // get a users current rank position
            rankPosArr = [];
            for (let i = 0; i < sortArr.length; i++) {
                await rankPosArr.push({ pos: i + 1, id: sortArr[i].id, xp: sortArr[i].xp });
            }

            const findInArr = await rankPosArr.find(m => m?.id === message?.author?.id);
            rankPos = findInArr?.pos;

            // update user's xp and xxp per 1 message, per 60 seconds
            await rankSchema.updateOne({
                id: message?.author?.id
            }, {
                rank: rankPos,
                username: newUsername,
                discrim: newDiscrim,
                avatar: message?.author.avatar,
                xp: xpMath,
                xxp: xxpMath
            }, {
                upsert: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

            // when a user ranks up, we reset their 'xxp'(level starting xp) to '0' and exponentially increase their 'xxxp'(xp needed until next rank)
            if (xxpMath > xxxpInt) {
                let levelMath = parseInt(level) + 1;
                let exponential = 5 * Math.pow(levelMath, 2) + (50 * levelMath) + 100 - 0;

                await rankSchema.updateOne({
                    id: message?.author?.id
                }, {
                    level: levelMath,
                    xp: xpMath,
                    xxp: 0,
                    xxxp: exponential
                }, {
                    upsert: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                botChan.send({
                    content: `${message?.author}, you just advanced to **Rank ${levelMath}**`
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

                let ver = guild.roles.cache.get(process.env.VERIFIED_ROLE);
                let lv5 = guild.roles.cache.get(process.env.RANK5_ROLE);
                let lv10 = guild.roles.cache.get(process.env.RANK10_ROLE);
                let lv15 = guild.roles.cache.get(process.env.RANK15_ROLE);
                let lv20 = guild.roles.cache.get(process.env.RANK20_ROLE);
                let lv25 = guild.roles.cache.get(process.env.RANK25_ROLE);
                let lv30 = guild.roles.cache.get(process.env.RANK30_ROLE);

                if (levelMath === 5) {
                    message?.member?.roles.add(lv5)
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));
                }
                if (levelMath === 10) {
                    message?.member?.roles.add(lv10)
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));
                    message?.member?.roles.add(ver)
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));
                    message?.member?.roles.remove(lv5)
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem removing a role: `, err));

                }
                if (levelMath === 15) {
                    message?.member?.roles.add(lv15)
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));
                    message?.member?.roles.remove(lv10)
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem removing a role: `, err));
                }
                if (levelMath === 20) {
                    message?.member?.roles.add(lv20)
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));
                    message?.member?.roles.remove(lv15)
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem removing a role: `, err));
                }
                if (levelMath === 25) {
                    message?.member?.roles.add(lv25)
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));
                    message?.member?.roles.remove(lv20)
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem removing a role: `, err));
                }
                if (levelMath === 30) {
                    message?.member?.roles.add(lv30)
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));
                    message?.member?.roles.remove(lv25)
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem removing a role: `, err));
                }
            }
        }
        // add user to xpLimit for 60 seconds to prevent spamming for xp
        xpLimit.add(message?.author?.id)

        setTimeout(() => {
            xpLimit.delete(message?.author?.id)
        }, 60000);
    }

    // count all new messages towards msgCount
    if (!results) results = await rankSchema.find({ id: message?.author?.id }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));

    for (const data of results) {
        let { msgCount } = data;

        let msgMath = parseInt(msgCount) + 1;

        await rankSchema.updateOne({
            id: message?.author?.id
        }, {
            msgCount: msgMath
        }, {
            upsert: true
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
    }
}