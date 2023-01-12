const { CommandInteraction, InteractionType } = require("discord.js");
const { dbUpdateOne, sendResponse } = require('../../../utils/utils');
const { confirmationModal, completePurchase, checkConfirmation } = require('../../buttons/store/store_functions');
const tokensSchema = require('../../../schemas/misc/tokens_schema');
const ytNotificationSchema = require('../../../schemas/misc/yt_notification_schema');
const res = new (require("rss-parser"))();
const path = require('path');

/**
 * @param {CommandInteraction} interaction 
 */
module.exports = async (interaction) => {
    let { guild, member, customId } = interaction;

    const storeName = customId.split('-')[0];
    const itemIndex = customId.split('-')[1];
    if (itemIndex === 'one') itemName = 'Twitch Auto (permanent)', btnIndex = 0;
    if (itemIndex === 'two') itemName = 'YouTube Auto (permanent)', btnIndex = 1;
    let cost = interaction.message.components[0].components[btnIndex].label.replaceAll('⠀', '').replaceAll(' ', '');
    let customMessage = ``;

    // One
    if (itemIndex === 'one') {
        // This item is free for server boosters
        if ((member.roles.cache.has(process.env.BOOSTER_ROLE) || (member.roles.cache.has(process.env.SUBSCRIBER_ROLE))) && !customId.includes('gift')) cost = 0;

        // Present the user with a confirmation modal
        if (interaction.type !== InteractionType.ModalSubmit) return confirmationModal(interaction, storeName, itemName, itemIndex, cost);

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        // Make sure the user confirmed the purchase
        if (!await checkConfirmation(interaction)) return;

        // If item is being purcahsed as a gift
        if (customId.includes('gift')) giftee = interaction.fields.getTextInputValue('input0');
        if (customId.includes('gift')) member = await guild.members.fetch(giftee).catch(() => { })
        // If a member can't be found
        if (!member) return sendResponse(interaction, `${process.env.BOT_DENY} The giftee ID you entered does not belong to a member of this server`);

        // Two instances of this item can't be active at the same time, check if the user has an active subscription
        const results = await tokensSchema.find({ userId: member.id });
        if ((results[0]?.twitchauto - new Date()) > 1 || results[0]?.twitchauto === true)
            return sendResponse(interaction, `${process.env.BOT_DENY} ${member} already has an active subscription for this item. If you need help, please contact a staff member`);

        // Attempt to complete the purchase and continue if successful
        if (await completePurchase(interaction, cost, itemName, customMessage, member)) {
            // Add expiry timestamp or boolean to user's db entry
            await dbUpdateOne(tokensSchema, { userId: member.id }, { twitchauto: true });
        }
    }

    // Two
    if (itemIndex === 'two') {
        // If item is being purcahsed as a gift
        if (customId.includes('gift') && interaction.member.id !== process.env.OWNER_ID) return sendResponse(interaction, `${process.env.BOT_DENY} This item cannot be gifted`);

        // This item is free for server boosters
        if ((member.roles.cache.has(process.env.BOOSTER_ROLE) || (member.roles.cache.has(process.env.SUBSCRIBER_ROLE))) && !customId.includes('gift')) cost = 0;

        // Present the user with a confirmation modal
        if (interaction.type !== InteractionType.ModalSubmit) return confirmationModal(interaction, storeName, itemName, itemIndex, cost);

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        // Make sure the user confirmed the purchase
        if (!await checkConfirmation(interaction)) return;

        // If item is being purcahsed as a gift
        if (customId.includes('gift')) giftee = interaction.fields.getTextInputValue('input0');
        if (customId.includes('gift')) member = await guild.members.fetch(giftee).catch(() => { })
        // If a member can't be found
        if (!member) return sendResponse(interaction, `${process.env.BOT_DENY} The giftee ID you entered does not belong to a member of this server`);

        // Two instances of this item can't be active at the same time, check if the user has an active subscription
        const results = await tokensSchema.find({ userId: member.id });
        if ((results[0]?.youtubeauto - new Date()) > 1 || results[0]?.youtubeauto === true)
            return sendResponse(interaction, `${process.env.BOT_DENY} ${member} already has an active subscription for this item. If you need help, please contact a staff member`);

        // Attempt to complete the purchase and continue if successful
        if (await completePurchase(interaction, cost, itemName, customMessage, member)) {
            const channelId = interaction.fields.getTextInputValue('input2');
            // Add expiry timestamp or boolean to user's db entry
            await dbUpdateOne(tokensSchema, { userId: member.id }, { youtubeauto: true });
            // Add the user to the youtube auto db
            try {
                // We need to store a list of the user's current video IDs
                const resolve = await res.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`)
                const items = resolve.items;
                let videoIdArr = [];
                items.forEach(item => {
                    // Remove the XML markup from video IDs
                    const regex = item.id.replace('yt:video:', '');
                    videoIdArr.push(regex);
                });
                await dbUpdateOne(ytNotificationSchema, { userId: member.id }, { userId: member.id, channelId: channelId, videoIds: videoIdArr });
            } catch {
                // If an error occurs
                sendResponse(interaction, `${process.env.BOT_DENY} An error occurred. Please contact a staff member for help`);
            }
        }
    }
}