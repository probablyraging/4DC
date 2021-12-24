const { Message } = require('discord.js');
const linkCooldown = require('../../modules/link_cooldown');
const ckqPost = require('../../modules/ckq_post');

module.exports = {
    name: `messageCreate`,
    /**
     * 
     * @param {Message} message
     */
    async execute(message, client, Discord) {

        linkCooldown(message, client, Discord);
        ckqPost(message, client, Discord);

    }
}