const { Message } = require('discord.js');
const linkCooldown = require('../../modules/link_cooldown');

module.exports = {
    name: `messageCreate`,
    /**
     * 
     * @param {Message} message
     */
    execute(message, client, Discord) {

        linkCooldown(message, client, Discord);

    }
}