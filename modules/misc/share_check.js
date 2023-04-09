const path = require('path');

module.exports = async (message, client, Discord) => {
    // YouTube channel
    if (message?.channel.id === process.env.YOUTUBE_CHAN && !message.author.bot) {
        if (!message?.content.includes('youtube.com/') && !message?.content.includes('youtu.be/')) {
            message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        }
    }

    // Twitch channel
    if (message?.channel.id === process.env.TWITCH_CHAN && !message.author.bot) {
        if (!message?.content.includes('twitch.com/') && !message?.content.includes('twitch.tv/')) {
            message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        }
    }

    // TikTok channel
    if (message?.channel.id === process.env.TIKTOK_CHAN && !message.author.bot) {
        if (!message?.content.includes('tiktok.com/')) {
            message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        }
    }

    // Instagram channel
    if (message?.channel.id === process.env.INSTAGRAM_CHAN && !message.author.bot) {
        if (!message?.content.includes('instagram.com/')) {
            message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        }
    }

    // Twitter channel
    if (message?.channel.id === process.env.TWITTER_CHAN && !message.author.bot) {
        if (!message?.content.includes('twitter.com/') & !message?.content.includes('t.co/')) {
            message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        }
    }

    // Spotify channel
    if (message?.channel.id === process.env.SPOTIFY_CHAN && !message.author.bot) {
        if (!message?.content.includes('spotify.com/') && !message?.content.includes('soundcloud.com/')) {
            message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        }
    }

    // Misc channel
    if (message?.channel.id === process.env.MISCSHARE_CHAN && !message.author.bot) {
        if (['youtube.com/', 'youtu.be/', 'twitch.com/', 'twitch.tv/', 'tiktok.com/', 'instagram.com/', 'twitter.com/', 't.co/', 'spotify.com/', 'soundcloud.com/',].some(str => message?.content.includes(str))) {
            message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        }
    }

    // GIF only channel
    if (message?.channel.id === process.env.GIFONLY_CHAN && !message.author.bot) {
        if (!message?.content.includes('tenor.com/')) {
            message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        }
    }
}