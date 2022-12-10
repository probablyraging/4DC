const { CommandInteraction, InteractionType } = require("discord.js");
const { confirmationModal, completePurchase, checkConfirmation } = require('../../buttons/store/store_functions');
const tokensSchema = require('../../../schemas/misc/tokens_schema');
const rankSchema = require("../../../schemas/misc/rank_schema");
const path = require('path');

/**
 * @param {CommandInteraction} interaction 
 */
module.exports = async (interaction) => {
    const { member, customId } = interaction;

    const storeName = customId.split('-')[0];
    const itemIndex = customId.split('-')[1];
    if (itemIndex === 'one') itemName = 'Skip Current Rank', btnIndex = 0;
    if (itemIndex === 'two') itemName = 'Double XP', btnIndex = 1;
    if (itemIndex === 'three') itemName = 'Double XP', btnIndex = 2;
    let cost = interaction.message.components[0].components[btnIndex].label.replaceAll('⠀', '').replaceAll(' ', '');
    let customMessage = ``;

    // One
    if (itemIndex === 'one') {
        customMessage = `\n\nYour rank will update the next time you send a message`;

        // Cost is determined by how much XP the user needs to reach the next rank
        const results = await rankSchema.find({ id: member.id });
        cost = Math.floor((results[0]?.xxxp - results[0]?.xxp) / 8);

        // Present the user with a confirmation modal
        if (interaction.type !== InteractionType.ModalSubmit) return confirmationModal(interaction, storeName, itemName, itemIndex, cost);

        await interaction.deferReply({ ephemeral: true });

        // Make sure the user confirmed the purchase
        if (!await checkConfirmation(interaction)) return;

        // Attempt to complete the purchase and continue if successful
        if (await completePurchase(interaction, cost, itemName, customMessage)) {
            // Update the user's rank XP
            await rankSchema.updateOne({
                id: member.id
            }, {
                xxp: results[0]?.xxxp - 1
            }, {
                upsert: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
        }
    }

    // Three
    if (itemIndex === 'two') {
        // Present the user with a confirmation modal
        if (interaction.type !== InteractionType.ModalSubmit) return confirmationModal(interaction, storeName, itemName, itemIndex, cost);

        await interaction.deferReply({ ephemeral: true });

        // Make sure the user confirmed the purchase
        if (!await checkConfirmation(interaction)) return;

        // Two instances of this item can't be active at the same time, check if the user has an active subscription
        const results = await tokensSchema.find({ userId: member.id });
        if ((results[0]?.doublexp - new Date()) > 1 || results[0]?.doublexp === true) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} You already have an active subscription for this item. If you need help, please contact a staff member`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }

        // Attempt to complete the purchase and continue if successful
        if (await completePurchase(interaction, cost, itemName, customMessage)) {
            // Future timestamp for auto expiry
            const oneWeek = 24 * 60 * 60 * 7 * 1000;
            const timestamp = new Date().valueOf() + oneWeek;
            // Add expiry timestamp or boolean to user's db entry
            await tokensSchema.updateOne({
                userId: member.id
            }, {
                doublexp: timestamp
            }, {
                upsert: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
        }
    }

    // Thre
    if (itemIndex === 'three') {
        // Present the user with a confirmation modal
        if (interaction.type !== InteractionType.ModalSubmit) return confirmationModal(interaction, storeName, itemName, itemIndex, cost);

        await interaction.deferReply({ ephemeral: true });

        // Make sure the user confirmed the purchase
        if (!await checkConfirmation(interaction)) return;

        // Two instances of this item can't be active at the same time, check if the user has an active subscription
        const results = await tokensSchema.find({ userId: member.id });
        if ((results[0]?.doublexp - new Date()) > 1 || results[0]?.doublexp === true) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} You already have an active subscription for this item. If you need help, please contact a staff member`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }

        // Attempt to complete the purchase and continue if successful
        if (await completePurchase(interaction, cost, itemName, customMessage)) {
            // Future timestamp for auto expiry
            const oneDay = 24 * 60 * 60 * 1000;
            const timestamp = new Date().valueOf() + oneDay;
            // Add expiry timestamp or boolean to user's db entry
            await tokensSchema.updateOne({
                userId: member.id
            }, {
                doublexp: timestamp
            }, {
                upsert: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
        }
    }
}