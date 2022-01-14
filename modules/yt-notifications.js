const mongo = require('../mongo');
const ytNotificationSchema = require('../schemas/yt-notification-schema');
const path = require('path');
const res = new (require('rss-parser'))();

module.exports = async (client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const staffChan = guild.channels.cache.get(process.env.STAFF_CHAN);
    const staffPromoChan = guild.channels.cache.get(process.env.STAFF_PROMO);
    const boostPromoChan = guild.channels.cache.get(process.env.BOOST_PROMO);

    await mongo().then(async mongoose => {
        setInterval(async () => {
            const results = await ytNotificationSchema.find({});

            for (const data of results) {
                const { channelId, videoIds, userId } = data;

                // if the user isn't a booster or staff member, we can remove them from the database
                const member = guild.members.cache.get(userId);
                if (!member?.roles?.cache.has(process.env.BOOST_ROLE) && !member?.roles?.cache.has(process.env.STAFF_ROLE) && !member?.roles?.cache.has(process.env.MOD_ROLE)) {
                    await ytNotificationSchema.findOneAndRemove({ userId })
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem removing a database entry: `, err));

                    staffChan.send({
                        content: `${member} has been removed from the **AUTOYT** list because they're no longer a server booster`
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                }

                // parse youtube's RSS XML feed as something we can read
                const resolve = await res.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
                const items = resolve.items;

                items.forEach(async item => {
                    // remove the XML markup from video IDs
                    const regex = item.id.replace('yt:video:', '');

                    if (!videoIds.includes(regex)) {
                        const userTag = guild.members.cache.get(userId).user?.tag;

                        // add the user's new video ID to the database
                        videoIds.push(regex);

                        await ytNotificationSchema.findOneAndUpdate({
                            userId: userId,
                        }, {
                            userId: userId,
                            channelId: channelId,
                            videoIds: videoIds
                        }, {
                            upsert: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                        // send a notification to a specific channel, depending on the user's roles
                        if (member?.roles?.cache.has(process.env.BOOST_ROLE)) {
                            boostPromoChan.send({
                                content: `**${userTag}** just uploaded a new video - ${item.link}`
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                        }

                        if (member?.roles?.cache.has(process.env.STAFF_ROLE) || member?.roles?.cache.has(process.env.MOD_ROLE)) {
                            staffPromoChan.send({
                                content: `**${userTag}** just uploaded a new video - ${item.link}`
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                        }
                    }
                });
            }
        }, 30000);
    }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));
}