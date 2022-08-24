const { Message, EmbedBuilder } = require('discord.js');
const { ImgurClient } = require('imgur');
const path = require('path');
/**
 * @param {Message} message 
 */
module.exports = async (message, client) => {
    if (message?.channel.id === process.env.RES_CHAN) {
        message?.react('<a:upvote:842350442297688074>');
        message?.react('<a:downvote:842350442481713153>');
    }
}