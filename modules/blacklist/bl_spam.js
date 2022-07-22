const { Message } = require('discord.js');
const repeatedMsg = new Map();
const timedout = new Set();
const sleep = require("timers/promises").setTimeout;
const path = require('path');
/**
 * @param {Message} message 
 */
module.exports = async (message, client) => {
    /**
     * This blacklist focuses on preventing dusplicate message spam
     */
    if (!message?.member?.roles.cache.has(process.env.STAFF_ROLE) && !message?.author.bot) {
        const author = message?.author.id;
        const content = message?.content;
        const found = repeatedMsg.get(content);

        if (found && !timedout.has(author)) {
            // If a user sends the same message 4 times or more in a 15 second period
            if (found.author === author && found.count >= 4) {
                for (const [key, val] of repeatedMsg.entries()) {
                    const channel = client.channels.cache.get(val.channelId);
                    // Fetch a gorup of previous messages
                    const fetch = await channel?.messages.fetch({ limit: 20 });
                    const filter = await fetch.filter(m => m?.author?.id === val.author && m?.content === val.content);
                    // Push the durplicate message ids to our array for bulk deleting
                    let filtered = [];
                    filter.forEach(m => {
                        filtered.push(m);
                    });
                    channel.bulkDelete(filtered).catch(err => console.error(`${path.basename(__filename)} There was a problem bulk deleting messages: `, err));
                }
                // Tiemout the user for 5 minutes and notify them
                const member = message?.member;
                member?.timeout(300000, 'Spam detection').catch(err => console.error(`${path.basename(__filename)} There was a problem adding a timeout: `, err));
                member?.send({
                    content: `${process.env.BOT_DENY} You have been timed out for 5 minutes for spamming. If this is a mistake, please content a staff member`
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message to a user. This usually happens when the target has DMs disabled: `, err));
                // Add the user to a set for 15 seconds. This prevents the bot trying to take action again
                timedout.add(author);
                setTimeout(() => {
                    timedout.delete(author);
                }, 15000);
                await sleep(300);
            } else if (found.author == author && found.count < 4) {
                repeatedMsg.set(content, { author, content, channelId: message?.channelId, msgId: message?.id, count: found.count + 1 });
            }
        } else {
            repeatedMsg.set(content, { author, content, channelId: message?.channelId, msgId: message?.id, count: 1 });
            setTimeout(() => {
                repeatedMsg.delete(content);
            }, 15000);
        }
    }
}