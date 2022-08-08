const { Message, EmbedBuilder } = require('discord.js');
const sleep = require("timers/promises").setTimeout;
const path = require('path');
/**
 * @param {Message} message 
 */
module.exports = async (message, client) => {
    /**
     * This blacklist focuses on not allowing mass mention spamming, usually done by server raid bots
     */
    if (message?.deleted) return;
    
    const reason = 'Mess Mentions';
    const timestamp = new Date().getTime();

    const member = message?.member;

    if (!member?.roles?.cache.has(process.env.STAFF_ROLE) && !message?.author?.bot && message?.mentions?.members?.size > 4) {
        member?.send({
            content: `${process.env.BOT_DENY} Mass mentions (${message?.mentions?.members?.size}) detected. You have been timedout for 60 seconds to prevent spamming`
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message to a user. This usually happens when the target has DMs disabled: `, err));

        setTimeout(() => { message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 600);

        member?.timeout(60000, 'Mass mentions').catch(err => console.error(`${path.basename(__filename)} There was a problem adding a timeout: `, err));

        let msgContent = message?.content || ` `;
        if (message?.content.length > 1000) msgContent = message?.content.slice(0, 1000) + '...' || ` `;
        await sleep(300);
    }
}

