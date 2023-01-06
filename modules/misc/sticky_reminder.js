const { Message } = require('discord.js');
const path = require('path');
/**
 * 
 * @param {Message} message 
 */
module.exports = async (message, client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const promoChan = guild.channels.cache.get(process.env.CONTENT_SHARE);
    const premChan = guild.channels.cache.get(process.env.PREM_CHAN);
    const avatarURL = client.user.avatarURL({ format: 'png', size: 256 });

    // Content share
    if (message?.channel.id === process.env.CONTENT_SHARE) {
        // Account for the bot posting live now URLs
        if (message.author.bot && !message.content.includes('https://')) return;
        try {
            // Fetch a group of messages and find the previous reminder
            const messages = await promoChan.messages.fetch({ limit: 5 });
            const messageFound = messages.find(m => m.author.id === client.user.id && m.content.includes('friendly reminder'));
            // Delete the previous reminder and resend it
            if (messageFound) await messageFound.delete().catch(err => console.error(`There was a problem deleting a message: `, err));
            await promoChan.send({
                content: `:warning: Hey there, just a friendly reminder that a more effective way of growing your audience is by networking with other creators on the server. Feel free to come introduce yourself and meet the other server members in <#820889004055855147> :warning:`
            }).catch(err => console.error(`There was a problem sending a message: `, err));
        } catch (err) {
            console.error(`There was a problem fetching messages in the content share channel: `, err);
        }
    }

    // Premium Ads
    if (message?.channel.id === process.env.PREM_CHAN && !message?.author.bot) {
        try {
            // Fetch a group of messages and find the previous reminder
            const messages = await premChan.messages.fetch({ limit: 5 });
            const messageFound = messages.find(m => m.content.includes('purchase an ad spot'));
            // Delete the previous reminder and resend it as a webhook
            if (messageFound) await messageFound.delete().catch(err => console.error(`There was a problem deleting a message: `, err));
            await premChan.createWebhook({ name: client.user.username, avatar: `${avatarURL}` }).then(webhook => {
                webhook.send({
                    content: `${process.env.BOT_INFO} Looking to purchase an ad spot? Take a look at [this post](https://discord.com/channels/820889004055855144/907446635435540551/907463741174587473)`,
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err));
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err));
        } catch (err) {
            console.error(`There was a problem fetching messages in the premium ad channel: `, err);
        }
    }
}