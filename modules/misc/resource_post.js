const { Message } = require('discord.js');
/**
 * @param {Message} message 
 */
module.exports = async (message, client) => {
    if (message?.channel.id === process.env.RES_CHAN) {
        message?.react('<a:upvote:842350442297688074>');
        message?.react('<a:downvote:842350442481713153>');
    }
}