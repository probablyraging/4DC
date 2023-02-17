const { Message } = require('discord.js');
const { dbFind, dbCreate, dbUpdateOne } = require('../../utils/utils');
const rankSchema = require('../../schemas/misc/rank_schema');
const xpLimit = new Set();

/**
 * Get a random number.
 * @param {Object} message The message object
 * @param {Object} userTokenData The user token data object
 * @return {number} A random number
 */
function randomNum(message) {
    return (message?.member?.roles.cache.has(process.env.BOOSTER_ROLE) || (message?.member?.roles.cache.has('1061554108005355570')))
        ? Math.floor(Math.random() * (50 - 30 + 1) + 30)
        : Math.floor(Math.random() * (25 - 15 + 1) + 15);
}

/**
 * 
 * @param {Message} message 
 */
module.exports = async (message, client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const botChan = guild.channels.cache.get(process.env.BOT_CHAN);
    const disableXP = [process.env.BOT_CHAN, process.env.YOUTUBE_CHAN, process.env.TWITCH_CHAN, process.env.TIKTOK_CHAN, process.env.INSTAGRAM_CHAN, process.env.TWITTER_CHAN, process.env.SPOTIFY_CHAN]

    let userRankData;
    if (!message?.author?.bot && !xpLimit.has(message?.author?.id)) {
        // If the message is in an XP disabled channel, don't add XP
        if (disableXP.includes(message?.channel?.id)) return;
        // Fetch the user's database entry
        userRankData = await dbFind(rankSchema, { userId: message?.author?.id });
        // Check to see if the user is in our database yet, if not, add them
        if (userRankData.length === 0) {
            await dbCreate(rankSchema, {
                rank: 0,
                userId: message?.author?.id,
                username: message?.author.username,
                discrim: message?.author.discriminator,
                avatar: message?.author.avatar,
                level: 0,
                msgCount: 0,
                xp: 0,
                xxp: 0,
                xxxp: 100
            });
            // Fetch the new created database entry for the user
            userRankData = await dbFind(rankSchema, { userId: message?.author?.id });
        }

        for (const data of userRankData) {
            const { xp, xxp, xxxp, level } = data;

            const random = randomNum(message);
            let xpMath = parseInt(xp + random);
            const xxpMath = parseInt(xxp + random);

            const xxxpInt = parseInt(xxxp);
            const newUsername = message?.author?.username;
            const newDiscrim = message?.author?.discriminator;

            // TODO: testing to see if this solves an error
            if (isNaN(xpMath)) xpMath = parseInt(xp);

            // Update user's xp and xxp every message, once every 60 seconds
            await dbUpdateOne(rankSchema, { userId: message?.author?.id }, { username: newUsername, discrim: newDiscrim, avatar: message?.author.avatar, xp: xpMath, xxp: xxpMath });

            // When a user ranks up, we reset their 'xxp'(level starting xp) to '0' and exponentially increase their 'xxxp'(xp needed until next rank)
            if (xxpMath > xxxpInt) {
                const levelMath = parseInt(level) + 1;
                // The amount to increase the user's xp by
                const exponential = 5 * Math.pow(levelMath, 2) + (50 * levelMath) + 100 - 0;
                // Update the user's database entry
                await dbUpdateOne(rankSchema, { userId: message?.author?.id }, { level: levelMath, xp: xpMath, xxp: 0, xxxp: exponential });
                // Add and/or remove the appropriate rank roles for the user
                try {
                    // Main guild
                    const ver = guild.roles.cache.get(process.env.VERIFIED_ROLE);
                    const lv5 = guild.roles.cache.get(process.env.RANK5_ROLE);
                    const lv10 = guild.roles.cache.get(process.env.RANK10_ROLE);
                    const lv15 = guild.roles.cache.get(process.env.RANK15_ROLE);
                    const lv20 = guild.roles.cache.get(process.env.RANK20_ROLE);
                    const lv25 = guild.roles.cache.get(process.env.RANK25_ROLE);
                    const lv30 = guild.roles.cache.get(process.env.RANK30_ROLE);
                    const lv35 = guild.roles.cache.get(process.env.RANK35_ROLE);
                    const lv40 = guild.roles.cache.get(process.env.RANK40_ROLE);
                    const lv45 = guild.roles.cache.get(process.env.RANK45_ROLE);
                    const lv50 = guild.roles.cache.get(process.env.RANK50_ROLE);
                    if (levelMath === 5) {
                        message?.member?.roles.add(lv5);
                    }
                    if (levelMath === 10) {
                        message?.member?.roles.add(lv10);
                        message?.member?.roles.add(ver);
                        message?.member?.roles.remove(lv5);
                    }
                    if (levelMath === 15) {
                        message?.member?.roles.add(lv15);
                        message?.member?.roles.remove(lv10);
                    }
                    if (levelMath === 20) {
                        message?.member?.roles.add(lv20);
                        message?.member?.roles.remove(lv15);
                    }
                    if (levelMath === 25) {
                        message?.member?.roles.add(lv25);
                        message?.member?.roles.remove(lv20);
                    }
                    if (levelMath === 30) {
                        message?.member?.roles.add(lv30);
                        message?.member?.roles.remove(lv25);
                    }
                    if (levelMath === 35) {
                        message?.member?.roles.add(lv35);
                        message?.member?.roles.remove(lv30);
                    }
                    if (levelMath === 40) {
                        message?.member?.roles.add(lv40);
                        message?.member?.roles.remove(lv35);
                    }
                    if (levelMath === 45) {
                        message?.member?.roles.add(lv45);
                        message?.member?.roles.remove(lv40);
                    }
                    if (levelMath === 50) {
                        message?.member?.roles.add(lv50);
                        message?.member?.roles.remove(lv45);
                    }
                    // Send the user a notification
                    botChan.send({
                        content: `${message?.author}, you just advanced to **Rank ${levelMath}**`
                    });
                } catch (err) {
                    console.error('There was a problem updating roles in the rank_xp module: ', err);
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
    if (!userRankData) userRankData = await dbFind(rankSchema, { userId: message?.author?.id });
    for (const data of userRankData) {
        let { msgCount } = data;
        let msgMath = parseInt(msgCount) + 1;
        await dbUpdateOne(rankSchema, { userId: message?.author?.id }, { msgCount: msgMath });
    }
}