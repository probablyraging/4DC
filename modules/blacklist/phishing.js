const { Message } = require('discord.js');
const sdp = require('stop-discord-phishing');
const path = require('path');

/**
 * @param {Message} message 
 */
module.exports = async (message, client) => {
    if (message.author?.id === process.env.OWNER_ID || message.deleted || message.author?.bot) return;

    const staffChan = client.channels.cache.get(process.env.STAFF_CHAN);
    const reason = 'Phishing link';
    const member = message.member;
    const messageContent = message.content.toLowerCase();

    // Check if the message contains a phishing link
    const isPhishing = await sdp.checkMessage(messageContent);
    if (isPhishing) {
        try {
            // Timeout the member for one week and send them a DM
            await member.timeout(86400 * 1000 * 7, reason);
            await member.send(`${process.env.BOT_DENY} Phishing link detected. You have been timed out until a staff member can verify if this is a mistake or not. If this is a mistake, please contact a staff member`);
            // Delete the message after 600ms
            setTimeout(() => message.delete(), 600);
            // Create a webhook and send a message to the staff channel
            const webhook = await staffChan.createWebhook(client.user.username, { avatar: client.user.avatarURL({ format: 'png', size: 256 }) });
            await webhook.send(`<@&885919072791973898>
${message.author} posted a link that looks like a phishing link. Please review [this message](${message.url}) if it exists, and ban them if neccassary`);
            // Delete the webhook after 10s
            setTimeout(() => webhook.delete(), 10000);
        } catch (error) {
            console.error(`${path.basename(__filename)} There was a problem deleting a phishing link: `, err);
        }
    }
}