const { Message, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const path = require('path');
/**
 * 
 * @param {Message} message 
 */
module.exports = async (message, client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const youtubeShare = guild.channels.cache.get(process.env.YOUTUBE_CHAN);
    const premChan = guild.channels.cache.get(process.env.PREM_CHAN);
    const avatarURL = client.user.avatarURL({ format: 'png', size: 256 });

    // Content share
    if (message?.channel.id === process.env.YOUTUBE_CHAN && !message.author.bot) {
        try {
            // Fetch a group of messages and find the previous reminder
            const messages = await youtubeShare.messages.fetch({ limit: 5 });
            const messageFound = messages.find(m => m.author.id === client.user.id && m.content.includes('browser extension'));
            // Delete the previous reminder and resend it
            if (messageFound) await messageFound.delete().catch(err => console.error(`There was a problem deleting a message: `, err));
            await youtubeShare.send({
                content: `:warning:** Want likes and views on your YouTube videos? Check out the ForTheContent browser extension at** <https://chrome.google.com/webstore/detail/forthecontent/kbnghoajbjomkegkhiiafelmmecnajhd>`
            }).catch(err => console.error(`There was a problem sending a message: `, err));
        } catch (err) {
            console.error(`There was a problem fetching messages in the content share channel: `, err);
        }
    }

    // Premium Ads
    const button = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('ad-info')
                .setLabel('Information')
                .setStyle(ButtonStyle.Primary)
        );

    if (message?.channel.id === process.env.PREM_CHAN && !message?.author.bot) {
        try {
            // Fetch a group of messages and find the previous reminder
            const messages = await premChan.messages.fetch({ limit: 5 });
            const messageFound = messages.find(m => m.content.includes('purchase an ad spot'));
            // Delete the previous reminder and resend it as a webhook
            if (messageFound) await messageFound.delete().catch(err => console.error(`There was a problem deleting a message: `, err));
            await premChan.createWebhook({ name: client.user.username, avatar: `${avatarURL}` }).then(webhook => {
                webhook.send({
                    content: `${process.env.BOT_INFO} Looking to purchase an ad spot? Click for more information`,
                    components: [button]
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err))
                    .then(() => {
                        webhook.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook: `, err));
                    });
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err));
        } catch (err) {
            console.error(`There was a problem fetching messages in the premium ad channel: `, err);
        }
    }
}