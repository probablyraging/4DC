const { Message } = require('discord.js');
const repeatedMsg = new Map();
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

        if (found) {
            if (found.author === author && found.count >= 4) {
                for (const [key, val] of repeatedMsg.entries()) {
                    const channel = client.channels.cache.get(val.channelId);

                    const fetch = await channel?.messages.fetch({ limit: 20 });
                    const filter = await fetch.filter(m => m?.author?.id === val.author);

                    let filtered = [];
                    fetch.filter(msg => {
                        if (m => m?.author?.id === val.author && m?.content === val.content) {
                            filtered.push(msg);
                        }
                    });

                    channel.bulkDelete(filtered).catch(err => console.error(`${path.basename(__filename)} There was a problem bulk deleting messages: `, err));
                }

                const member = message?.member;

                member?.timeout(30000, 'Repetitive messages').catch(err => console.error(`${path.basename(__filename)} There was a problem adding a timeout: `, err));
            } else if (found.author == author && found.count < 4) {
                repeatedMsg.set(content, { author, content, channelId: message?.channelId, msgId2: message?.id, count: found.count + 1 });
            }
        } else {
            repeatedMsg.set(content, { author, content, channelId: message?.channelId, msgId: message?.id, count: 1 });

            setTimeout(() => {
                repeatedMsg.delete(content);
            }, 15000);
        }
    }
}