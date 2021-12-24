const { Message } = require('discord.js');
const linkCooldown = require('../../modules/link_cooldown');
const ckqPost = require('../../modules/ckq_post');
const bumpPost = require('../../modules/bump_post');
const levelsCheck = require('../../modules/levels_check');
const invitesCheck = require('../../modules/invites_check');

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

        // delete posts containing tweets in the insider channel
        if (message?.channel.id === process.env.INSIDER_CHAN) {
            if (message?.content.toLowerCase().includes('tweet')) {
                message?.delete().catch(err => { return; });
            }
        }
    }
}