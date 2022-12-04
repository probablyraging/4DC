const ytNotificationSchema = require('../../schemas/misc/yt_notification_schema');
const path = require('path');
const res = new (require('rss-parser'))();

module.exports = async (client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const staffChan = guild.channels.cache.get(process.env.STAFF_CHAN);
    const boostPromoChan = guild.channels.cache.get(process.env.BOOSTER_PROMO);

    setInterval(async () => {
        // a quick check to see if we get any errors
        await res.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=UCIjouN_iuJswbC6MJltMl_A`, function (err, resolve) {
            if (err) return console.log(`Unable to fetch AUTOYT feed`);
        });

        const results = await ytNotificationSchema.find({});

        for (const data of results) {
            const { channelId, videoIds, userId } = data;

            // if the user isn't a booster or staff member, we can remove them from the database
            const member = guild.members.cache.get(userId);
            if (!member?.roles?.cache.has(process.env.BOOST_ROLE) && !member?.roles?.cache.has(process.env.STAFF_ROLE)) {
                await ytNotificationSchema.findOneAndRemove({ userId })
                    .catch(err => console.error(`${path.basename(__filename)} There was a problem removing a database entry: `, err));

                staffChan.send({
                    content: `${member} has been removed from the **AUTOYT** list because they're no longer a staff member or server booster`
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
            }

            // parse youtube's RSS XML feed as something we can read
            await res.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, function (err, resolve) {
                const items = resolve.items;

                items.forEach(async item => {
                    // remove the XML markup from video IDs
                    const regex = item.id.replace('yt:video:', '');

                    if (!videoIds.includes(regex)) {
                        const userTag = guild.members.cache.get(userId).user?.tag;

                        // add the user's new video ID to the database
                        videoIds.push(regex);

                        await ytNotificationSchema.updateOne({
                            userId: userId,
                        }, {
                            userId: userId,
                            channelId: channelId,
                            videoIds: videoIds
                        }, {
                            upsert: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                        // send a notification to a specific channel, depending on the user's roles
                        boostPromoChan.send({
                            content: `**${userTag}** just uploaded a new video - ${item.link}`
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                    }
                });
            });
        }
    }, 300000);
}