const tweetsSchema = require('../../schemas/misc/tweets_schema');
const cronjob = require('cron').CronJob;
const fetch = require('node-fetch');
const path = require('path');

module.exports = async (client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const newsChan = guild.channels.cache.get(process.env.NEWS_CHAN);
    const twitterUserIds = ['3031071234', '309366491', '3065618342'] // YouTube, Twitch, Discord
    const youtube = new cronjob('0 */2 * * *', async function () {
        let results = await tweetsSchema.find();
        let tweetIdsArr = [];
        if (results.length === 0) {
            await tweetsSchema.create({
                ids: tweetIdsArr
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem creating a database entry: `, err));
            results = await tweetsSchema.find();
        }
        for (let i in twitterUserIds) {
            const resolve = await fetch(`https://api.twitter.com/2/users/${twitterUserIds[i]}/tweets?exclude=retweets,replies&tweet.fields=source`, { headers: { "Authorization": `Bearer ${process.env.TAPI_BEARER_TOKEN}` } });
            const data = await resolve.json();

            if (!results[0]?.ids.includes(data.data[0].id)) {
                tweetIdsArr.push(data.data[0].id);
                let user;
                if (i === 0) user = 'youtube';
                if (i === 1) user = 'twitchdev';
                if (i === 2) user = 'discord';
                await newsChan.send({
                    content: `https://twitter.com/${user}/status/${data.data[0].id}`
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
            }
        }
        for (const data of results) {
            const { ids } = data;
            ids.push.apply(ids, tweetIdsArr);
            await tweetsSchema.updateOne({
                ids: ids
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
        }
    });
    youtube.start();
}