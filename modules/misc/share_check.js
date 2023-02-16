const path = require('path');

module.exports = async (message, client, Discord) => {
    // YouTube channel
    if (message?.channel.id === process.env.YOUTUBE_CHAN) {
        if (!message?.content.include('youtube.com/') || !message?.content.include('youtu.be/')) {
            message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        }
    }

    // Twitch channel
    if (message?.channel.id === process.env.TWITCH_CHAN) {
        if (!message?.content.include('twitch.com/') || !message?.content.include('twitch.tv/')) {
            message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        }
    }

    // TikTok channel
    if (message?.channel.id === process.env.TIKTOK_CHAN) {
        if (!message?.content.include('tiktok.com/')) {
            message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        }
    }

    // Instagram channel
    if (message?.channel.id === process.env.INSTAGRAM_CHAN) {
        if (!message?.content.include('instagram.com/')) {
            message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        }
    }

    // Twitter channel
    if (message?.channel.id === process.env.TWITTER_CHAN) {
        if (!message?.content.include('twitter.com/') || !message?.content.include('t.co/')) {
            message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        }
    }

    // Spotify channel
    if (message?.channel.id === process.env.SPOTIFY_CHAN) {
        if (!message?.content.include('spotify.com/') || !message?.content.include('soundcloud.com')) {
            message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        }
    }
}