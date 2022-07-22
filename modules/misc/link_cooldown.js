const { Message, EmbedBuilder } = require('discord.js');
const { logToDatabase } = require('../dashboard/log_to_database');
const cooldown = new Set();
const sleep = require("timers/promises").setTimeout;
const path = require('path');
/**
 * @param {Message} message 
 */

module.exports = async (message, client) => {
    const reason = 'Link Cooldown';
    const timestamp = new Date().getTime();

    const author = message?.author;

    const content = message?.content.toLocaleLowerCase();
    const conditions = ['https://', 'http://', 'www.'];
    const check = conditions.some(el => content.includes(el));

    if (!author) {
        return;
    } else {
        if (check && !message?.member?.permissions.has("ManageMessages") && !message?.member?.roles.cache.has(process.env.RANK5_ROLE) && !message?.member?.roles.cache.has(process.env.VERIFIED_ROLE) && !message?.author?.bot) {
            if (cooldown.has(message?.author?.id)) {
                author?.send({
                    content: `${process.env.BOT_DENY} You're sending links too fast. Please wait 30 seconds between posting`,
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message to a user. This usually happens when the target has DMs disabled: `, err))
                    .then(() => {
                        setTimeout(() => {
                            message?.delete().catch(err => console.error(`${path.basename(__filename)} 3 ### THIS IS EXPECTED SOME TIMES: `, err));
                        }, 600);

                        let msgContent = message?.content || ` `;
                        if (message?.content.length > 1000) msgContent = message?.content.slice(0, 1000) + '...' || ` `;

                        logToDatabase(message?.author?.id, message?.author?.tag, message?.channel.name, reason, msgContent, timestamp, reason);
                    });

                await sleep(300);
            } else {
                cooldown.add(message?.author.id)

                setTimeout(() => {
                    cooldown.delete(message?.author.id)
                }, 30000);
            }
        }
    }
}