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
const path = require('path');

module.exports = {
    name: `messageCreate`,
    /**
     * @param {Message} message
     */
    async execute(message, client) {
        // Ignore DM messages
        if (message?.channel.type === 1) return;

        // blacklist checks
        linkCooldown(message, client);
        blPhishing(message, client);
        blSpam(message, client);

        // bump and ckq checks
        ckqPost(message);
        bumpPost(message);

        // game checks
        lastLetter(message, client);
        countingGame(message, client);

        // misc checks
        rankXP(message, client);
        creatorCrew(message, client);
        resPost(message, client);
        suggestionPost(message);

        // delete posts containing tweets in the insider channel
        if (message?.channel.id === process.env.INSIDER_CHAN) {
            if (message?.content.toLowerCase().includes("tweet")) {
                message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
            }
        }

        // delete all messages in FAQ thread channel
        if (message?.channel.id === process.env.FAQ_CHAN && !message?.author.bot) {
            message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        }
    }
};
