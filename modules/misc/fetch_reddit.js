const { dbUpdateOne, dbFindOne } = require('../../utils/utils');
const redditSchema = require('../../schemas/misc/reddit_schema');
const cronjob = require('cron').CronJob;
const fetch = require('node-fetch');
const path = require('path');

module.exports = async (client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const memeChan = guild.channels.cache.get(process.env.MEME_CHAN);

    // Fetch reddit posts from r/memes and post them to the meme channel
    const fetchRedditPosts = new cronjob('0 */2 * * *', async function () {
        // Fetch already published reddit post IDs from the database
        const results = await dbFindOne(redditSchema);
        const postIds = results ? results.postIds : [];

        // Fetch the previous 10 "top" posts from r/memes
        let newPosts = [];
        let newPostIds = [];
        await fetch('https://www.reddit.com/r/memes/top.json?limit=10')
            .then(response => response.json())
            .then(async data => {
                const redditPosts = data.data.children;
                for (const post of redditPosts) {
                    // If the post ID is already in the database 
                    if (results.postIds.includes(post.data.id)) continue;
                    // Push new IDs to and media URLs to appropriate arrays
                    if (!post.data.media) newPosts.push({ title: post.data.title, imageUrl: post.data.url });
                    if (post.data.media) newPosts.push({ title: post.data.title, imageUrl: post.data.media.reddit_video.fallback_url });
                    newPostIds.push(post.data.id);
                }
            });
        // If we have new posts, send them to the media channel
        if (newPosts.length > 0) {
            newPosts.forEach(post => {
                memeChan.send({
                    content: post.title,
                    files: [post.imageUrl]
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
            });
        }
        // If there are new post IDs update the database
        if (newPostIds.length > 0) await dbUpdateOne(redditSchema, { _id: results._id }, { postIds: [...postIds, ...newPostIds] });
    });
    fetchRedditPosts.start();
}