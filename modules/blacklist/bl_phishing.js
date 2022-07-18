const { Message, EmbedBuilder } = require('discord.js');
const { logToDatabase } = require('../dashboard/log_to_database');
const sdp = require('stop-discord-phishing');
const sleep = require("timers/promises").setTimeout;
const path = require('path');
/**
 * @param {Message} message 
 */
module.exports = async (message, client) => {
    /**
     * This blacklist focuses on strict blacklisting in all channels for known phishing links
     */
    if (message?.author.id === process.env.OWNER_ID || message?.deleted || message?.author.bot) return;
    
    const staffChan = client.channels.cache.get(process.env.STAFF_CHAN);
    const reason = 'Phishing link';
    const timestamp = new Date().getTime();

    const member = message?.member;

    const contLow = message?.content.toLowerCase();

    async function checkMessage(content) {
        let isPhishing = await sdp.checkMessage(content);

        if (isPhishing) {
            member?.timeout(86400 * 1000 * 7, `${reason}`).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a timeout: `, err));

            member?.send({
                content: `${process.env.BOT_DENY} \`Phishing link detected. You have been timed out until a staff member can verify if this is a mistake or not. If this is a mistake, please contact a staff member\``
            }).catch(() => {
                message?.reply({
                    content: `${process.env.BOT_DENY} \`Phishing link detected. You have been timed out until a staff member can verify if this is a mistake or not. If this is a mistake, please contact a staff member\``,
                    allowedMentions: { repliedUser: true },
                    failIfNotExists: false
                }).catch(err => {
                    console.error(`${path.basename(__filename)} There was a problem sending a message: `, err);
                }).then(msg => {
                    setTimeout(() => { msg?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 10000);
                });
            });

            setTimeout(() => { message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err)) }, 600);

            let msgContent = message?.content || ` `;
            if (message?.content.length > 1000) msgContent = message?.content.slice(0, 1000) + '...' || ` `;

            const avatarURL = client.user.avatarURL({ format: 'png', size: 256 });

            staffChan.createWebhook(client.user.username, { avatar: avatarURL }).then(webhook => {
                webhook.send({
                    content: `<@&885919072791973898>
${message?.author} posted a link that looks like a phishing link. Please review [this message](${m?.url}) if it exists, and ban them if neccassary`,
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err));

                setTimeout(() => {
                    webhook.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook: `, err));
                }, 10000);
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem creating a webhook: `, err));

            logToDatabase(message?.author?.id, message?.author?.tag, message?.channel.name, reason, msgContent, timestamp, reason);
        }

        return isPhishing;
    }

    checkMessage(contLow);
    await sleep(300);
}