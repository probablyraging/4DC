const ytNotificationSchema = require('../../schemas/misc/yt_notification_schema');
const tokensSchema = require('../../schemas/misc/tokens_schema');
const path = require('path');
const res = new (require('rss-parser'))();

module.exports = async (client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const staffChan = guild.channels.cache.get(process.env.STAFF_CHAN);
    const contentShare = guild.channels.cache.get(process.env.CONTENT_SHARE);
    const boostPromoChan = guild.channels.cache.get(process.env.BOOSTER_PROMO);
    const boosterRole = process.env.BOOSTER_ROLE;
    const staffRole = process.env.STAFF_ROLE;

    setInterval(async () => {
        const results = await ytNotificationSchema.find();

        for (const { channelId, videoIds, userId } of results) {
            const member = guild.members.cache.get(userId);
            const userTag = member.user?.tag;
            const isBooster = member?.roles?.cache.has(boosterRole);
            const isStaff = member?.roles?.cache.has(staffRole);
            const tokenResult = await tokensSchema.findOne({ userId });
            const isTokenSub = (tokenResult?.youtubeauto - new Date()) < 1 && tokenResult?.youtubeauto !== true;

            if (!isBooster && !isStaff && !isTokenSub) {
                await ytNotificationSchema.findOneAndRemove({ userId })
                    .catch((err) => console.error(`${path.basename(__filename)} There was a problem removing a database entry: `, err));
                staffChan.send({
                    content: `${member} has been removed from the **YouTube Auto** list as they're no longer a staff member, server booster or tokens subscriber`,
                }).catch((err) => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
            }

            res.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, (err, resolve) => {
                if (err) return;

                resolve.items.forEach(async (item) => {
                    const regex = item.id.replace('yt:video:', '');

                    if (!videoIds.includes(regex)) {
                        videoIds.push(regex);

                        await ytNotificationSchema.updateOne({
                            userId,
                        }, {
                            userId,
                            channelId,
                            videoIds,
                        }, {
                            upsert: true,
                        }).catch((err) => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                        if (isBooster) {
                            contentShare.send({
                                content: `**${userTag}** just uploaded a new video - ${item.link}`,
                            }).catch((err) => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

                            boostPromoChan.send({
                                content: `**${userTag}** just uploaded a new video - ${item.link}`,
                            }).catch((err) => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                        } else {
                            contentShare.send({
                                content: `**${userTag}** just uploaded a new video - ${item.link}`,
                            }).catch((err) => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                        }
                    }
                });
            });
        }
    }, 300000);
}