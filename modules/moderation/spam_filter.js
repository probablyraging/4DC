const { Message } = require('discord.js');
const repeatedMessages = new Map();
const timedOutUsers = new Set();
const path = require('path');

/**
 * Check if a user has sent the same message multiple times in a short period of time.
 * @param {Message} message The message to be checked
 */
function isSpam(message) {
    const authorId = message.author.id;
    const content = message.content;

    // Check if the user is in the map and increment the count
    const authorMessages = repeatedMessages.get(authorId) || {};
    const messageCount = (authorMessages[content] || 0) + 1;
    authorMessages[content] = messageCount;
    // If the user has sent the same message at least 4 times
    if (messageCount >= 4) return true;
    // Update the map with the new count
    repeatedMessages.set(authorId, authorMessages);
    setTimeout(() => {
        repeatedMessages.delete(authorId);
    }, 15000);

    return false;
}

/**
 * Time out a user for a specific duration and send them a notification
 * @param {GuildMember} member The member to time out
 * @param {Number} duration The length of the timeout in milliseconds
 * @param {String} reason The reason for the timeout
 * @param {String} message The message to send to the user
 */
async function timeoutUser(member, duration, reason, message) {
    await member.timeout(duration, reason).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a timeout: `, err));
    await member.send(message).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message to a user. This usually happens when the target has DMs disabled: `, err));
}

module.exports = async (message, client) => {
    if (!message?.member?.roles.cache.has(process.env.STAFF_ROLE) && !message.author.bot) {
        const authorId = message.author.id;
        const content = message.content;

        try {
            // If the message is spam and the user has not been timed out yet
            if (isSpam(message) && !timedOutUsers.has(authorId)) {
                const channel = client.channels.cache.get(message.channelId);
                const messages = await channel.messages.fetch({ limit: 20 });
                // Filter the messages to find ones sent by the use with the same content
                const messagesToDelete = messages.filter(m => m.author.id === authorId && m.content === content);
                // Bulk delete the filtered messages
                channel.bulkDelete(messagesToDelete);

                const member = message.member;
                if (member) {
                    // Time the user out
                    const notificationForUser = `You have been timed out for 5 minutes for spamming. If this is a mistake, please contact a staff member`;
                    timeoutUser(member, 300000, 'Spam detection', notificationForUser);
                    // Add timedout users to a set so we don't try to time them out again
                    timedOutUsers.add(authorId);
                    setTimeout(() => {
                        timedOutUsers.delete(authorId);
                    }, 15000);
                }
            }
        } catch (err) {
            console.error('There was a problem with the spam module: ', err);
        }
    }
}