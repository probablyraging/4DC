const { CommandInteraction, InteractionType } = require("discord.js");
const { confirmationModal, completePurchase, checkConfirmation } = require('../../buttons/store/store_functions');
const tokensSchema = require('../../../schemas/misc/tokens_schema');
const spotlightSchema = require("../../../schemas/misc/spotlight_schema");
const countingSchema = require('../../../schemas/counting_game/counting_schema');
const { dbCreate, dbUpdateOne } = require('../../../utils/utils');
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
    if (itemIndex === 'one') itemName = 'Double XP (1 week)', btnIndex = 0;
    if (itemIndex === 'two') itemName = 'Game Saves', btnIndex = 1;
    if (itemIndex === 'three') itemName = 'Spotlight Tickets', btnIndex = 2;
    let cost = interaction.message.components[0].components[btnIndex].label.replaceAll('⠀', '').replaceAll(' ', '');
    let customMessage = ``;

    // One
    if (itemIndex === 'one') {
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
        if ((results[0]?.doublexp - new Date()) > 1 || results[0]?.doublexp === true) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} ${member} already has an active subscription for this item. If you need help, please contact a staff member`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }

        // Attempt to complete the purchase and continue if successful
        if (await completePurchase(interaction, cost, itemName, customMessage, member)) {
            // Future timestamp for auto expiry
            const oneWeek = 24 * 60 * 60 * 7 * 1000;
            const timestamp = new Date().valueOf() + oneWeek;
            // Add expiry timestamp or boolean to user's db entry
            await dbUpdateOne(tokensSchema, { userId: member.id }, { doublexp: timestamp });
        }
    }

    // Two
    if (itemIndex === 'two') {
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

        const amount = parseInt(interaction.fields.getTextInputValue('input8'));
        if (isNaN(amount) || amount < 1 || amount > 2) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} Amount must be a number from 1-2`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }

        // Add a counting save to the user
        const results = await countingSchema.find({ userId: member.id });

        // If amount is more saves than the user can have
        if (results.length > 0 && (results[0]?.saves + (amount)) > 2) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} You can only have a max of **2** personal saves at a time. ${member} already has **${results[0]?.saves}/2** saves`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }

        // If user already has max saves
        if (results.length > 0 && results[0]?.saves >= 2) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} ${member} already has **2/2** saves`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }

        // Determine cost based off amount purcahsed
        cost = cost * amount;

        // Attempt to complete the purchase and continue if successful
        if (await completePurchase(interaction, cost, itemName, customMessage, member)) {
            // If user doesn't have an entry yet
            if (results.length === 0) {
                await dbCreate(countingSchema, { userId: member.id, saves: amount, counts: 0 });
            } else {
                // Add a save to the user
                await dbUpdateOne(countingSchema, { userId: member.id }, { saves: results[0]?.saves + amount });
            }
        }
    }

    // Three
    if (itemIndex === 'three') {
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

        const amount = parseInt(interaction.fields.getTextInputValue('input3'));
        if (isNaN(amount) || amount < 1 || amount > 99) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} Amount must be a number from 1-99`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }

        const message = interaction.fields.getTextInputValue('input4');
        const url = interaction.fields.getTextInputValue('input7');

        // We only allow one URLs and only in the URL field
        if (detectURLs(message)?.length > 0) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} You cannot include a URL in the message field, please use the Content URL field instead`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
        if (detectURLs(url)?.length > 1) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} You can only submit one URL`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }

        // Determine cost based off amount purcahsed
        cost = cost * amount;

        // Attempt to complete the purchase and continue if successful
        if (await completePurchase(interaction, cost, itemName, customMessage, member)) {
            // Add a new db entry every time someone buys a ticket
            for (let i = 0; i < amount; i++) {
                await dbCreate(spotlightSchema, { userId: member.id, message: message, url: url });
            }
        }
    }
}