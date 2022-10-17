const { Message, EmbedBuilder } = require('discord.js');
const sleep = require("timers/promises").setTimeout;
const path = require('path');
/**
 * @param {Message} message 
 */
module.exports = async (message, client) => {
    /**
     * This blacklist focuses on delting messages containing everyone and here pings
     */
    if (message?.member?.roles?.cache.has(process.env.STAFF_ROLE) || message?.deleted || message?.author.bot) return;
    
    const reason = 'Everyone or Here ping';
    const timestamp = new Date().getTime();

    const contLow = message?.content.toLowerCase();

    const pingArr = ['@everyone', '@here'];

    for (let i in pingArr) {
        if (contLow.includes(pingArr[i])) {
            setTimeout(() => { message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 600);

            let msgContent = message?.content || ` `;
            if (message?.content.length > 1000) msgContent = message?.content.slice(0, 1000) + '...' || ` `;

            await sleep(300);
        }
    }
}