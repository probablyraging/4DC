const { Message } = require('discord.js');
const linkCooldown = require('../../modules/link_cooldown');
const ckqPost = require('../../modules/ckq_post');
const bumpPost = require('../../modules/bump_post');

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
    }
}