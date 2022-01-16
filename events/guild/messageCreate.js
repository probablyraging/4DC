const { Message } = require('discord.js');
const path = require('path');
const linkCooldown = require('../../modules/misc/link_cooldown');
const ckqPost = require('../../modules/bump_ckq/ckq_post');
const bumpPost = require('../../modules/bump_ckq/bump_post');
const blLinks = require('../../modules/blacklist/bl_links');
const blPromo = require('../../modules/blacklist/bl_promo');
const blMass = require('../../modules/blacklist/bl_mass');
const blWords = require('../../modules/blacklist/bl_words');
const blTwitch = require('../../modules/blacklist/bl_twitch');
const resPost = require('../../modules/misc/resource_post');
const lastletter = require('../../modules/games/last_letter');
const rankXP = require('../../modules/rank/rank_xp');

module.exports = {
    name: `messageCreate`,
    /**
     * 
     * @param {Message} message
     */
    async execute(message, client, Discord) {

        linkCooldown(message, client, Discord);
        blLinks(message, client, Discord);
        blPromo(message, client, Discord);
        blMass(message, client, Discord);
        blWords(message, client, Discord);
        blTwitch(message, client, Discord);
        ckqPost(message, client, Discord);
        bumpPost(message, client, Discord);
        resPost(message, client, Discord);
        lastletter(message, client, Discord);
        rankXP(message, client, Discord);

        // delete posts containing tweets in the insider channel
        if (message?.channel.id === process.env.INSIDER_CHAN) {
            if (message?.content.toLowerCase().includes('tweet')) {
                message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
            }
        }

        // remind people to use /rank command
        if (message?.channel?.id === process.env.BOT_CHAN && message?.content?.toLowerCase().includes('!rank')) {
            message?.reply({
                content: `${process.env.BOT_DENY} \`Please use /rank instead\``
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err))
                .then(msg => {
                    setTimeout(() => {
                        msg.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                    }, 5000);
                });

            setTimeout(() => {
                message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
            }, 100);
        }
    }
}