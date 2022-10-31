const { Message } = require('discord.js');
const creatorCrew = require("../../modules/creator_crew/check_new_post");
const linkCooldown = require('../../modules/misc/link_cooldown');
const ckqPost = require('../../modules/bump_ckq/ckq_post');
const bumpPost = require('../../modules/bump_ckq/bump_post');
const blSpam = require('../../modules/blacklist/spam');
const blPhishing = require('../../modules/blacklist/phishing');
const resPost = require('../../modules/misc/resource_post');
const lastLetter = require('../../modules/games/last_letter');
const countingGame = require('../../modules/games/counting_game');
const rankXP = require('../../modules/rank/rank_xp');
const suggestionPost = require('../../modules/misc/suggestion_post');
const stickyReminder = require('../../modules/misc/sticky_reminder');
const { newUsers } = require('../guild/guildMemberAdd');
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

        // Bump and ckq checks
        ckqPost(message);
        bumpPost(message);

        // Game checks
        lastLetter(message, client);
        countingGame(message, client);

        // Misc checks
        rankXP(message, client);
        creatorCrew(message, client);
        resPost(message, client);
        suggestionPost(message);
        stickyReminder(message, client);

        // If a user in the newUsers set sends a message in general, we can remove them from the set (Extends from welcome_check.js)
        if (message?.channel.id === process.env.GENERAL_CHAN && !message.author.bot && newUsers.has(message?.member.id)) newUsers.delete(message?.member.id);

        // Delete posts containing tweets in the insider channel
        if (message?.channel.id === process.env.NEWS_CHAN) {
            if (message?.content.toLowerCase().includes("tweet")) {
                message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
            }
        }

        // Delete all messages in FAQ thread channel
        if (message?.channel.id === process.env.FAQ_CHAN && !message?.author.bot) {
            message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        }

        // Delete links in media channel if user is new to the server
        const promoLinks = ['youtube.com/', 'youtu.be/', 'twitch.tv/', 'facebook.com/', 'instagram.com/', 'spotify.com/', 'tiktok.com/', 'twitter.com/'];
        const twelveHours = 12 * 60 * 60 * 1000;
        if (message?.channel.id === process.env.MEDIA_CHAN && !message?.author.bot && (new Date() - message?.member.joinedTimestamp) < twelveHours) {
            for (let i in promoLinks) {
                if (message?.content.includes(promoLinks[i])) {
                    message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                }
            }
        }
    }
};
