const tweetsSchema = require('../../schemas/misc/tweets_schema');
const cronjob = require('cron').CronJob;
const fetch = require('node-fetch');
const { dbUpdateOne } = require('../../modules/misc/database_update_handler');
const path = require('path');

module.exports = async (client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const newsChan = guild.channels.cache.get(process.env.NEWS_CHAN);
    const twitterUsernames = {
        '3031071234': 'youtube',
        '309366491': 'twitchdev',
        '3065618342': 'discord'
    };

    const fetchNewTweets = new cronjob('0 */2 * * *', async function () {
        const results = await tweetsSchema.findOne();
        const tweetIds = results ? results.ids : [];
        const newTweetIds = [];

        for (const userId in twitterUsernames) {
            // Get the username for the user ID
            const username = twitterUsernames[userId];
            // Fetch the latest tweets for each user
            const response = await fetch(`https://api.twitter.com/2/users/${userId}/tweets?exclude=retweets,replies&tweet.fields=source`, {
                headers: { "Authorization": `Bearer ${process.env.TAPI_BEARER_TOKEN}` }
            });
            const data = await response.json();

            // If there is no data, skip to the next iteration
            if (data.data.length === 0) continue;

            // Check if the tweet ID has already been sent, if not, add it to the newTweetIds array
            const tweetId = data.data[0].id;
            if (tweetIds.includes(tweetId)) continue;
            newTweetIds.push(tweetId);

            await newsChan.send({
                content: `https://twitter.com/${username}/status/${tweetId}`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
        }

        // If there are new tweet IDs
        if (newTweetIds.length > 0) {
            // Update the database entry with the new tweet IDs
            await dbUpdateOne(tweetsSchema, { _id: results._id }, { ids: [...tweetIds, ...newTweetIds] });
        }
    });
    fetchNewTweets.start();
}