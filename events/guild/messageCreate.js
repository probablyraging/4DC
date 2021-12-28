const { Message } = require('discord.js');
const path = require('path');
const linkCooldown = require('../../modules/link_cooldown');
const ckqPost = require('../../modules/ckq_post');
const bumpPost = require('../../modules/bump_post');
const levelsCheck = require('../../modules/levels_check');
const invitesCheck = require('../../modules/invites_check');
const blLinks = require('../../modules/bl_links');
const blPromo = require('../../modules/bl_promo');
const blMass = require('../../modules/bl_mass');
const blWords = require('../../modules/bl_words');
const blTwitch = require('../../modules/bl_twitch');
const resPost = require('../../modules/resource_post');
const lastletter = require('../../modules/last_letter');

module.exports = {
    name: `messageCreate`,
    /**
     * 
     * @param {Message} message
     */
    async execute(message, client, Discord) {

        linkCooldown(message, client, Discord);
        ckqPost(message, client, Discord);
        bumpPost(message, client, Discord);
        levelsCheck(message, client, Discord);
        invitesCheck(message, client, Discord);
        blLinks(message, client, Discord);
        blPromo(message, client, Discord);
        blMass(message, client, Discord);
        blWords(message, client, Discord);
        blTwitch(message, client, Discord);
        resPost(message, client, Discord);
        lastletter(message, client, Discord);

        // delete posts containing tweets in the insider channel
        if (message?.channel.id === process.env.INSIDER_CHAN) {
            if (message?.content.toLowerCase().includes('tweet')) {
                message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
            }
        }
    }
}