const { CommandInteraction, InteractionType } = require("discord.js");
const { confirmationModal, completePurchase, checkConfirmation } = require('../../buttons/store/store_functions');
const tokensSchema = require('../../../schemas/misc/tokens_schema');
const path = require('path');

/**
 * @param {CommandInteraction} interaction 
 */
module.exports = async (interaction) => {
    const { member, customId } = interaction;

    const storeName = customId.split('-')[0];
    const itemIndex = customId.split('-')[1];
    if (itemIndex === 'one') itemName = '', btnIndex = 0;
    if (itemIndex === 'two') itemName = '', btnIndex = 1;
    if (itemIndex === 'three') itemName = '', btnIndex = 2;
    if (itemIndex === 'four') itemName = '', btnIndex = 0;
    if (itemIndex === 'five') itemName = '', btnIndex = 1;
    if (itemIndex === 'six') itemName = '', btnIndex = 2;
    let cost = interaction.message.components[0].components[btnIndex].label.replaceAll('⠀', '').replaceAll(' ', '');
    let customMessage = ``;

    // One
    if (itemIndex === 'one') {
        // Present the user with a confirmation modal
        if (interaction.type !== InteractionType.ModalSubmit) return confirmationModal(interaction, storeName, itemName, itemIndex, cost);

        await interaction.deferReply({ ephemeral: true });

        // Make sure the user confirmed the purchase
        if (!await checkConfirmation(interaction)) return;

        // Attempt to complete the purchase and continue if successful
        if (await completePurchase(interaction, cost, itemName, customMessage)) {
            // Do stuff
        }
    }

    // Two
    if (itemIndex === 'two') {
        // Present the user with a confirmation modal
        if (interaction.type !== InteractionType.ModalSubmit) return confirmationModal(interaction, storeName, itemName, itemIndex, cost);

        await interaction.deferReply({ ephemeral: true });

        // Make sure the user confirmed the purchase
        if (!await checkConfirmation(interaction)) return;

        // Attempt to complete the purchase and continue if successful
        if (await completePurchase(interaction, cost, itemName, customMessage)) {
            // Do stuff
        }
    }
}