const { Message } = require('discord.js');
const linkCooldown = require('../../modules/misc/link_cooldown');
const bumpPost = require('../../modules/timers/bump_post');
const blSpam = require('../../modules/blacklist/spam');
const blPhishing = require('../../modules/blacklist/phishing');
const lastLetter = require('../../modules/games/last_letter');
const countingGame = require('../../modules/games/counting_game');
const rankXP = require('../../modules/rank/rank_xp');
const tokensSystem = require('../../modules/store/tokens_system');
const suggestionPost = require('../../modules/misc/suggestion_post');
const stickyReminder = require('../../modules/misc/sticky_reminder');
const { newUsers } = require('../guild/guildMemberUpdate');
const notifiedUsers = new Set();
const path = require('path');

module.exports = {
    name: `messageCreate`,
    /**
     * @param {Message} message
     */
    async execute(message, client) {
        // Ignore DM messages
        if (message?.channel.type === 1) return;

        // Blacklist checks
        linkCooldown(message, client);
        blPhishing(message, client);
        blSpam(message, client);

        // Bump and spotlight checks
        bumpPost(message, client);

        // Game checks
        lastLetter(message, client);
        countingGame(message, client);

        // Misc checks
        rankXP(message, client);
        tokensSystem(message, client);
        suggestionPost(message);
        stickyReminder(message, client);

        // Check automod embeds for Discord links and send the user a notification
        if (message?.channel.id === process.env.AUTOMOD_CHAN) {
            if (notifiedUsers.has(message?.author.id)) return;
            if (message.embeds[0].description.toLowerCase().includes('discord.com/invite') || message.embeds[0].description.toLowerCase().includes('discord.gg/')) {
                message?.author.send({
                    content: `Discord invite link sharing is only available to FTC++ subscribers \n\nLearn more <https://discord.com/channels/820889004055855144/role-subscriptions>`
                }).catch(() => { });
                notifiedUsers.add(message?.author.id);
            }
        }

        // If a user in the newUsers set sends a message in general, we can remove them from the set (Extends from welcome_check.js)
        if (message?.channel.id === process.env.GENERAL_CHAN && !message.author.bot && newUsers.has(message?.member.id)) newUsers.delete(message?.member.id);

        // Resend followed server messages, delete the original message and resend it
        if (message.channel.id === process.env.NEWS_CHAN && message.author.id === '900247274792304710') {
            setTimeout(async () => {
                const fetchedMessage = await message.channel.messages.fetch(message.id).catch(err => console.error(`${path.basename(__filename)} There was a problem fetching a message: `, err));;
                fetchedMessage.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                message.channel.send({
                    content: fetchedMessage.embeds[0].url
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
            }, 3000);
        }

        // Users must be in the server for more than 1 week before they can post links links in the media channels
        const promoLinks = ['youtube.com/', 'youtu.be/', 'twitch.tv/', 'facebook.com/', 'instagram.com/', 'spotify.com/', 'tiktok.com/', 'twitter.com/'];
        const oneDay = 24 * 7 * 60 * 60 * 1000;
        if (message?.channel.id === process.env.MEDIA_CHAN && !message?.author.bot && (new Date() - message?.member.joinedTimestamp) < oneDay) {
            for (let i in promoLinks) {
                if (message?.content.includes(promoLinks[i])) {
                    message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                }
            }
        }
    }
};
