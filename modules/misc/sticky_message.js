// eslint-disable-next-line no-unused-vars
import { Message, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';
/**
 *
 * @param {Message} message
 */
export default async (message, client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const premChan = guild.channels.cache.get(process.env.PREM_CHAN);
    const avatarURL = client.user.avatarURL({ format: 'png', size: 256 });

    // Premium Ads
    const button = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('ad-info')
                .setLabel('Information')
                .setStyle(ButtonStyle.Primary),
        );

    if (message?.channel.id === process.env.PREM_CHAN && !message?.author.bot) {
        try {
            // Fetch a group of messages and find the previous reminder
            const messages = await premChan.messages.fetch({ limit: 5 });
            const messageFound = messages.find(m => m.content.includes('purchase an ad spot'));
            // Delete the previous reminder and resend it as a webhook
            if (messageFound) await messageFound.delete().catch(err => console.error('There was a problem deleting a message: ', err));
            await premChan.createWebhook({ name: client.user.username, avatar: `${avatarURL}` }).then(webhook => {
                webhook.send({
                    content: `${process.env.BOT_INFO} Looking to purchase an ad spot? Click for more information`,
                    components: [button],
                }).catch(err => console.error('There was a problem sending a webhook message: ', err))
                    .then(() => {
                        webhook.delete().catch(err => console.error('There was a problem deleting a webhook: ', err));
                    });
            }).catch(err => console.error('There was a problem sending a webhook: ', err));
        } catch (err) {
            console.error('There was a problem fetching messages in the premium ad channel: ', err);
        }
    }
};