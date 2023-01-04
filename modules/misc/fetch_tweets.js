const { dbUpdateOne } = require('../../utils/utils');
const tweetsSchema = require('../../schemas/misc/tweets_schema');
const cronjob = require('cron').CronJob;
const fetch = require('node-fetch');
const path = require('path');

/**
 * Fetches the latest tweets for a given Twitter user.
 * @param {string} userId The Twitter user ID.
 * @returns {Promise<object>} A promise that resolves with the data returned by the Twitter API.
 */
async function fetchTweets(userId) {
    try {
        const response = await fetch(`https://api.twitter.com/2/users/${userId}/tweets?exclude=retweets,replies&tweet.fields=source`, {
            headers: { "Authorization": `Bearer ${process.env.TAPI_BEARER_TOKEN}` }
        });
        const data = await response.json();
        return data;
    } catch (err) {
        console.error(`${path.basename(__filename)} There was a problem fetching tweets: `, err);
    }
}

module.exports = async (client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const newsChan = guild.channels.cache.get(process.env.NEWS_CHAN);
    const twitterUsernames = {
        '3031071234': 'youtube',
        '309366491': 'twitchdev',
        '3065618342': 'discord'
    };

    const fetchNewTweets = new cronjob('0 */2 * * *', async function () {
        // Get already sent the tweet IDs from the database
        const results = await tweetsSchema.findOne();
        const tweetIds = results ? results.ids : [];
        // Store newly fetched tweet IDs
        const newTweetIds = [];

        for (const userId in twitterUsernames) {
            const username = twitterUsernames[userId];
            // Fetch the latest tweets for each userId
            const data = await fetchTweets(userId);
            if (data.data.length === 0) continue;

            // Get the tweet ID and check if it has already been sent
            const tweetId = data.data[0].id;
            if (tweetIds.includes(tweetId)) continue;
            // If not, add it to the newTweetIds array and send the tweet URL to the news channel
            newTweetIds.push(tweetId);
            await newsChan.send({
                content: `https://twitter.com/${username}/status/${tweetId}`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
        }

        // If there are new tweet IDs update the database
        if (newTweetIds.length > 0) {
            await dbUpdateOne(tweetsSchema, { _id: results._id }, { ids: [...tweetIds, ...newTweetIds] });
        }
    });
    fetchNewTweets.start();
}