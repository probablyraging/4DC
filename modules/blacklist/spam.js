const { Message } = require('discord.js');
const repeatedMessages = new Map();
const timedOutUsers = new Set();
const path = require('path');

/**
 * Check if a user has sent the same message multiple times in a short period of time.
 * @param {Message} message
 */
function isSpam(message) {
    const authorId = message.author.id;
    const content = message.content;

    const authorMessages = repeatedMessages.get(authorId) || {};
    const messageCount = (authorMessages[content] || 0) + 1;
    authorMessages[content] = messageCount;

    if (messageCount >= 4) {
        return true;
    }

    repeatedMessages.set(authorId, authorMessages);
    setTimeout(() => {
        repeatedMessages.delete(authorId);
    }, 15000);

    return false;
}

async function timeoutUser(member, duration, reason, message) {
    await member.timeout(duration, reason).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a timeout: `, err));
    await member.send(message).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message to a user. This usually happens when the target has DMs disabled: `, err));
}

module.exports = async (message, client) => {
    if (!message.author.bot) {
        const authorId = message.author.id;
        const content = message.content;

        if (isSpam(message) && !timedOutUsers.has(authorId)) {
            const channel = client.channels.cache.get(message.channelId);
            if (channel) {
                const messages = await channel.messages.fetch({ limit: 20 });
                const messagesToDelete = messages.filter(m => m.author.id === authorId && m.content === content);
                channel.bulkDelete(messagesToDelete).catch(() => {
                    // An error here is likely due to the bot not having permission to delete messages in the channel or because the messages are older than 14 days and cannot be deleted
                });
            }

            const member = message.member;
            if (member) {
                const notificationForUser = `${process.env.BOT_DENY} You have been timed out for 5 minutes for spamming. If this is a mistake, please contact a staff member`;
                timeoutUser(member, 300000, 'Spam detection', notificationForUser);
                timedOutUsers.add(authorId);
                setTimeout(() => {
                    timedOutUsers.delete(authorId);
                }, 15000);
            }
        }
    }
}