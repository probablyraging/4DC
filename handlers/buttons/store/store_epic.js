const { CommandInteraction, InteractionType } = require("discord.js");
const { confirmationModal, completePurchase, checkConfirmation } = require('../../../modules/store/store_functions');
const tokensSchema = require('../../../schemas/misc/tokens_schema');
const path = require('path');

/**
 * @param {CommandInteraction} interaction 
 */
module.exports = async (interaction) => {
    const { member, customId } = interaction;

    const storeName = customId.split('-')[0];
    const itemIndex = customId.split('-')[1];
    if (itemIndex === 'one') itemName = 'Amazon Giftcard', btnIndex = 0;
    if (itemIndex === 'two') itemName = 'Nitro', btnIndex = 1;
    if (itemIndex === 'three') itemName = 'Nitro Basic', btnIndex = 2;
    let cost = interaction.message.components[0].components[btnIndex].label.replaceAll('⠀', '').replaceAll(' ', '');
    let customMessage = ``;

    // One
    if (itemIndex === 'one') {
        customMessage = `\n\nPlease contact a staff member to complete your purchase`;
        // Present the user with a confirmation modal
        if (interaction.type !== InteractionType.ModalSubmit) return confirmationModal(interaction, storeName, itemName, itemIndex, cost);
        await interaction.deferReply({ ephemeral: true });
        // Make sure the user confirmed the purchase
        if (!await checkConfirmation(interaction)) return;
        // Attempt to complete the purchase and continue if successful
        await completePurchase(interaction, cost, itemName, customMessage);
    }

    // Two
    if (itemIndex === 'two') {
        customMessage = `\n\nPlease contact a staff member to complete your purchase`;
        // Present the user with a confirmation modal
        if (interaction.type !== InteractionType.ModalSubmit) return confirmationModal(interaction, storeName, itemName, itemIndex, cost);
        await interaction.deferReply({ ephemeral: true });
        // Make sure the user confirmed the purchase
        if (!await checkConfirmation(interaction)) return;
        // Attempt to complete the purchase and continue if successful
        await completePurchase(interaction, cost, itemName, customMessage);
    }

    // Three
    if (itemIndex === 'three') {
        customMessage = `\n\nPlease contact a staff member to complete your purchase`;
        // Present the user with a confirmation modal
        if (interaction.type !== InteractionType.ModalSubmit) return confirmationModal(interaction, storeName, itemName, itemIndex, cost);
        await interaction.deferReply({ ephemeral: true });
        // Make sure the user confirmed the purchase
        if (!await checkConfirmation(interaction)) return;
        // Attempt to complete the purchase and continue if successful
        await completePurchase(interaction, cost, itemName, customMessage);
    }
}