const { Message } = require('discord.js');
const linkCooldown = require('../../modules/misc/link_cooldown');
const ckqPost = require('../../modules/bump_ckq/ckq_post');
const bumpPost = require('../../modules/bump_ckq/bump_post');
const blLinks = require('../../modules/blacklist/bl_links');
const blPromo = require('../../modules/blacklist/bl_promo');
const blMass = require('../../modules/blacklist/bl_mass');
// const blWords = require('../../modules/blacklist/bl_words');
const blSpam = require('../../modules/blacklist/bl_spam');
const blPhishing = require('../../modules/blacklist/bl_phishing');
const blEveryone = require('../../modules/blacklist/bl_everyone');
// const blSub4Sub = require('../../modules/blacklist/bl_sub4sub');
const resPost = require('../../modules/misc/resource_post');
const lastLetter = require('../../modules/games/last_letter');
const countingGame = require('../../modules/games/counting_game');
const rankXP = require('../../modules/rank/rank_xp');
const creatorCrew = require("../../modules/mods_choice/mods_choice_messages");
const path = require('path');

module.exports = {
    name: `messageCreate`,
    /**
     * @param {Message} message
     */
    async execute(message, client) {
        // blacklist checks
        linkCooldown(message, client);
        blPhishing(message, client);
        blPromo(message, client);
        // blWords(message, client);
        blLinks(message, client);
        blMass(message, client);
        blSpam(message, client);
        blEveryone(message, client);
        // blSub4Sub(message, client);

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

        // delete posts containing tweets in the insider channel
        if (message?.channel.id === process.env.INSIDER_CHAN) {
            if (message?.content.toLowerCase().includes("tweet")) {
                message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
            }
        }
    }
};
