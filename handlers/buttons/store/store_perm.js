const { CommandInteraction, InteractionType } = require("discord.js");
const { confirmationModal, completePurchase, checkConfirmation } = require('../../buttons/store/store_functions');
const { dbUpdateOne } = require('../../../utils/utils');
const tokensSchema = require('../../../schemas/misc/tokens_schema');
const ytNotificationSchema = require('../../../schemas/misc/yt_notification_schema');
const res = new (require("rss-parser"))();
const path = require('path');

function detectURLs(message) {
    let urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
    return message.match(urlRegex)
}

/**
 * @param {CommandInteraction} interaction 
 */
module.exports = async (interaction) => {
    let { guild, member, customId } = interaction;

    const storeName = customId.split('-')[0];
    const itemIndex = customId.split('-')[1];
    if (itemIndex === 'one') itemName = 'Twitch Auto (permanent)', btnIndex = 0;
    if (itemIndex === 'two') itemName = 'YouTube Auto (permanent)', btnIndex = 1;
    if (itemIndex === 'three') itemName = 'Link Embeds (permanent)', btnIndex = 2;
    let cost = interaction.message.components[0].components[btnIndex].label.replaceAll('⠀', '').replaceAll(' ', '');
    let customMessage = ``;

    // One
    if (itemIndex === 'one') {
        // This item is free for server boosters
        if (member.roles.cache.has(process.env.BOOSTER_ROLE) && !customId.includes('gift')) cost = 0;

        // Present the user with a confirmation modal
        if (interaction.type !== InteractionType.ModalSubmit) return confirmationModal(interaction, storeName, itemName, itemIndex, cost);

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        // Make sure the user confirmed the purchase
        if (!await checkConfirmation(interaction)) return;

        // If item is being purcahsed as a gift
        if (customId.includes('gift')) giftee = interaction.fields.getTextInputValue('input0');
        if (customId.includes('gift')) member = await guild.members.fetch(giftee).catch(() => { })
        if (!member) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} The giftee ID you entered does not belong to a member of this server`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }

        // Two instances of this item can't be active at the same time, check if the user has an active subscription
        const results = await tokensSchema.find({ userId: member.id });
        if ((results[0]?.twitchauto - new Date()) > 1 || results[0]?.twitchauto === true) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} ${member} already has an active subscription for this item. If you need help, please contact a staff member`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }

        // Attempt to complete the purchase and continue if successful
        if (await completePurchase(interaction, cost, itemName, customMessage, member)) {
            // Add expiry timestamp or boolean to user's db entry
            await dbUpdateOne(tokensSchema, { userId: member.id }, { twitchauto: true });
        }
    }

    // Two
    if (itemIndex === 'two') {
        // If item is being purcahsed as a gift
        if (customId.includes('gift') && interaction.member.id !== process.env.OWNER_ID) {
            return interaction.reply({
                content: `${process.env.BOT_DENY} This item cannot be gifted`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }

        // This item is free for server boosters
        if (member.roles.cache.has(process.env.BOOSTER_ROLE) && !customId.includes('gift')) cost = 0;

        // Present the user with a confirmation modal
        if (interaction.type !== InteractionType.ModalSubmit) return confirmationModal(interaction, storeName, itemName, itemIndex, cost);

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        // Make sure the user confirmed the purchase
        if (!await checkConfirmation(interaction)) return;

        // If item is being purcahsed as a gift
        if (customId.includes('gift')) giftee = interaction.fields.getTextInputValue('input0');
        if (customId.includes('gift')) member = await guild.members.fetch(giftee).catch(() => { })
        if (!member) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} The giftee ID you entered does not belong to a member of this server`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }

        // Two instances of this item can't be active at the same time, check if the user has an active subscription
        const results = await tokensSchema.find({ userId: member.id });
        if ((results[0]?.youtubeauto - new Date()) > 1 || results[0]?.youtubeauto === true) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} ${member} already has an active subscription for this item. If you need help, please contact a staff member`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }

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
                interaction.editReply({
                    content: `${process.env.BOT_DENY} An error occurred. Please contact a staff member for help`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
            }
        }
    }

    // Three
    if (itemIndex === 'three') {
        // This item is free for server boosters
        if (member.roles.cache.has(process.env.BOOSTER_ROLE) && !customId.includes('gift')) cost = 0;

        // Present the user with a confirmation modal
        if (interaction.type !== InteractionType.ModalSubmit) return confirmationModal(interaction, storeName, itemName, itemIndex, cost);

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        // Make sure the user confirmed the purchase
        if (!await checkConfirmation(interaction)) return;

        // If item is being purcahsed as a gift
        if (customId.includes('gift')) giftee = interaction.fields.getTextInputValue('input0');
        if (customId.includes('gift')) member = await guild.members.fetch(giftee).catch(() => { })
        if (!member) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} The giftee ID you entered does not belong to a member of this server`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }

        // Two instances of this item can't be active at the same time, check if the user has an active subscription
        const results = await tokensSchema.find({ userId: member.id });
        if ((results[0]?.linkembeds - new Date()) > 1 || results[0]?.linkembeds === true) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} ${member} already has an active subscription for this item. If you need help, please contact a staff member`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }

        // Attempt to complete the purchase and continue if successful
        if (await completePurchase(interaction, cost, itemName, customMessage, member)) {
            const contentShare = guild.channels.cache.get(process.env.CONTENT_SHARE);
            // Edit the channel permissions for the user to allow link embeds  
            contentShare.permissionOverwrites.edit(member.id, {
                EmbedLinks: true,
            }).catch(err => { return console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err) });

            // Add expiry timestamp or boolean to user's db entry
            await dbUpdateOne(tokensSchema, { userId: member.id }, { linkembeds: true });
        }
    }
}