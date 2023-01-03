const { Message } = require('discord.js');
const { dbCreate, dbUpdateOne } = require('../../utils/utils');
const rankSchema = require('../../schemas/misc/rank_schema');
const tokensSchema = require('../../schemas/misc/tokens_schema');
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
        // If the message is in an XP disabled channel, don't add XP
        if (disableXP.includes(message?.channel?.id)) return;

        results = await rankSchema.find({ id: message?.author?.id }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
        // Check to see if the user is in our database yet, if not, add them
        if (results.length === 0) {
            await dbCreate(rankSchema, {
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
            });
        }

        // Fetch users with an active sub to double XP
        const results2 = await tokensSchema.find({ userId: message?.author.id });
        // Get a random number
        function randomNum() {
            if (message?.member?.roles.cache.has(process.env.BOOSTER_ROLE) || (results2[0]?.doublexp - new Date()) > 1) {
                return Math.floor(Math.random() * (50 - 30 + 1) + 30);
            } else {
                return Math.floor(Math.random() * (25 - 15 + 1) + 15);
            }
        }

        for (const data of results) {
            let { xp, xxp, xxxp, level, msgCount } = data;

            let random = randomNum();
            let xpMath = parseInt(xp) + random;
            let xxpMath = parseInt(xxp) + random;

            let xxxpInt = parseInt(xxxp);
            let newUsername = message?.author?.username;
            let newDiscrim = message?.author?.discriminator;

            // Update user's xp and xxp every message, once every 60 seconds
            await dbUpdateOne(rankSchema, { id: message?.author?.id }, { username: newUsername, discrim: newDiscrim, avatar: message?.author.avatar, xp: xpMath, xxp: xxpMath });

            // When a user ranks up, we reset their 'xxp'(level starting xp) to '0' and exponentially increase their 'xxxp'(xp needed until next rank)
            if (xxpMath > xxxpInt) {
                let levelMath = parseInt(level) + 1;
                let exponential = 5 * Math.pow(levelMath, 2) + (50 * levelMath) + 100 - 0;

                await dbUpdateOne(rankSchema, { id: message?.author?.id }, { level: levelMath, xp: xpMath, xxp: 0, xxxp: exponential });

                // Send the user a notification and add and remove the appropriate roles for them
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
                let lv35 = guild.roles.cache.get(process.env.RANK35_ROLE);
                let lv40 = guild.roles.cache.get(process.env.RANK40_ROLE);
                let lv45 = guild.roles.cache.get(process.env.RANK45_ROLE);
                let lv50 = guild.roles.cache.get(process.env.RANK50_ROLE);

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
                if (levelMath === 35) {
                    message?.member?.roles.add(lv35)
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));
                    message?.member?.roles.remove(lv30)
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem removing a role: `, err));
                }
                if (levelMath === 40) {
                    message?.member?.roles.add(lv40)
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));
                    message?.member?.roles.remove(lv35)
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem removing a role: `, err));
                }
                if (levelMath === 45) {
                    message?.member?.roles.add(lv45)
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));
                    message?.member?.roles.remove(lv40)
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem removing a role: `, err));
                }
                if (levelMath === 50) {
                    message?.member?.roles.add(lv50)
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));
                    message?.member?.roles.remove(lv45)
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem removing a role: `, err));
                }
            }
        }
        // add user to xpLimit for 60 seconds to prevent spamming for xp
        xpLimit.add(message?.author?.id);
        setTimeout(() => {
            xpLimit.delete(message?.author?.id);
        }, 60000);
    }
    // Count all new messages towards msgCount
    if (!results) results = await rankSchema.find({ id: message?.author?.id }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
    for (const data of results) {
        let { msgCount } = data;
        let msgMath = parseInt(msgCount) + 1;
        await dbUpdateOne(rankSchema, { id: message?.author?.id }, { msgCount: msgMath });
    }
}