const { Message } = require('discord.js');
const mongo = require('../mongo');
const rankSchema = require('../schemas/rank-schema');
const path = require('path');
const xpLimit = new Set();
/**
 * 
 * @param {Message} message 
 */
module.exports = async (message, client, Discord) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const botChan = guild.channels.cache.get(process.env.BOT_CHAN);

    if (!message?.author?.bot && !xpLimit.has(message?.author?.id)) {
        await mongo().then(async mongoose => {

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

            // use this to remove non-existent users from top 100
            // for (var i = 0; i < 100; i++) {
            //     console.log({ id: rankPosArr[i].id, pos: rankPosArr[i].pos })

            //     const exists = guild.members.cache.get(rankPosArr[i].id)

            //     if (!exists) {
            //         await rankSchema.findOneAndRemove({ id: rankPosArr[i].id })
            //     }
            // }

            // use this to correct rank position if needed
            // for (var i = 0; i < rankPosArr.length; i++) {
            //     console.log({ id: rankPosArr[i].id, pos: rankPosArr[i].pos })
            //     await rankSchema.findOneAndUpdate({
            //         id: rankPosArr[i].id
            //     }, {
            //         rank: rankPosArr[i].pos
            //     }, {
            //         upsert: true
            //     })
            // }

            const results = await rankSchema.find({ id: message?.author?.id }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
            // check to see if the user is in our database yet, if not, add them
            if (results.length === 0) {
                await rankSchema.findOneAndUpdate({
                    rank: 0,
                    id: message?.author?.id,
                    username: message.author.username,
                    discrim: message.author.discriminator,
                    level: 0,
                    msgCount: 0,
                    xp: 0,
                    xxp: 0,
                    xxxp: 100
                }, {
                    rank: 0,
                    id: message?.author?.id,
                    username: message.author.username,
                    discrim: message.author.discriminator,
                    level: 0,
                    msgCount: 0,
                    xp: 0,
                    xxp: 0,
                    xxxp: 100
                }, {
                    upsert: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
            }

            // get a random number between 15 and 25
            function randomNum(min, max) {
                return Math.floor(Math.random() * (max - min + 1) + min);
            }

            for (const data of results) {
                let { xp, xxp, xxxp, level, msgCount } = data;

                let msgMath = parseInt(msgCount) + 1;
                let random = randomNum(15, 25);
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
                await rankSchema.findOneAndUpdate({
                    id: message?.author?.id
                }, {
                    rank: rankPos,
                    username: newUsername,
                    discrim: newDiscrim,
                    xp: xpMath,
                    xxp: xxpMath
                }, {
                    upsert: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                // when a user ranks up, we reset their 'xxp'(level starting xp) to '0' and exponentially increase their 'xxxp'(xp needed until next rank)
                if (xxpMath > xxxpInt) {
                    let levelMath = parseInt(level) + 1;
                    let exponential = 5 * Math.pow(levelMath, 2) + (50 * levelMath) + 100 - 0;

                    await rankSchema.findOneAndUpdate({
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
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));
        // add user to xpLimit for 60 seconds to prevent spamming for xp
        xpLimit.add(message?.author?.id)

        setTimeout(() => {
            xpLimit.delete(message?.author?.id)
        }, 60000);
    }

    // count all new messages towards msgCount
    await mongo().then(async mongoose => {
        const results = await rankSchema.find({ id: message?.author?.id }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));

        for (const data of results) {
            let { msgCount } = data;

            let msgMath = parseInt(msgCount) + 1;

            await rankSchema.findOneAndUpdate({
                id: message?.author?.id
            }, {
                msgCount: msgMath
            }, {
                upsert: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
        }
    }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));
}