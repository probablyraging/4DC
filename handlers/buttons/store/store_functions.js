const { ActionRowBuilder, TextInputBuilder, ModalBuilder } = require("discord.js");
const { dbUpdateOne } = require('../../../utils/utils');
const tokensSchema = require('../../../schemas/misc/tokens_schema');
const path = require('path');

// Modal to confirm purchase
async function confirmationModal(interaction, storeName, itemName, itemIndex, cost) {
    const modal = new ModalBuilder()
        .setTitle(`${itemName}`)
        .setCustomId(`${storeName}-${itemIndex}-confirm`)

    // If gifting
    const input0 = new TextInputBuilder()
        .setCustomId('input0')
        .setLabel(`Giftee's User ID`)
        .setStyle(1)
        .setMinLength(1)
        .setMaxLength(32)
        .setRequired(true)
    const row0 = new ActionRowBuilder().addComponents([input0]);
    if (interaction.customId.includes('gift')) modal.addComponents(row0);

    // YouTube Auto
    const input2 = new TextInputBuilder()
        .setCustomId('input2')
        .setLabel(`YouTube Channel ID`)
        .setStyle(1)
        .setMinLength(1)
        .setMaxLength(56)
        .setRequired(true)
    const row2 = new ActionRowBuilder().addComponents([input2]);
    if (interaction.customId.includes('gifttemp-two') || interaction.customId.includes('giftperm-two') || interaction.customId === 'perm-two' || interaction.customId === 'temp-two') modal.addComponents(row2);

    // Spotlight Ticket
    const input3 = new TextInputBuilder()
        .setCustomId('input3')
        .setLabel(`Amount (max 99)`)
        .setPlaceholder('Total cost will be (cost * amount)')
        .setStyle(1)
        .setMinLength(1)
        .setMaxLength(2)
        .setRequired(true)
    const row3 = new ActionRowBuilder().addComponents([input3]);
    if (interaction.customId === 'misc-three' || interaction.customId.includes('giftmisc-three')) modal.addComponents(row3);
    const input4 = new TextInputBuilder()
        .setCustomId('input4')
        .setLabel(`Message`)
        .setStyle(2)
        .setMinLength(1)
        .setMaxLength(1024)
        .setRequired(true)
    const row4 = new ActionRowBuilder().addComponents([input4]);
    if (interaction.customId === 'misc-three' || interaction.customId.includes('giftmisc-three')) modal.addComponents(row4);
    const input7 = new TextInputBuilder()
        .setCustomId('input7')
        .setLabel(`Content URL`)
        .setStyle(1)
        .setMinLength(1)
        .setMaxLength(1024)
        .setRequired(true)
    const row7 = new ActionRowBuilder().addComponents([input7]);
    if (interaction.customId === 'misc-three' || interaction.customId.includes('giftmisc-three')) modal.addComponents(row7);

    // Game Saves
    const input8 = new TextInputBuilder()
        .setCustomId('input8')
        .setLabel(`Amount (max 2)`)
        .setPlaceholder('Total cost will be (cost * amount)')
        .setStyle(1)
        .setMinLength(1)
        .setMaxLength(2)
        .setRequired(true)
    const row8 = new ActionRowBuilder().addComponents([input8]);
    if (interaction.customId === 'misc-two' || interaction.customId.includes('giftmisc-two')) modal.addComponents(row8);

    // Confirmation
    const input1 = new TextInputBuilder()
        .setCustomId('confirmation')
        .setLabel(`Confirm your purchase for ${cost} tokens`)
        .setPlaceholder('Type the word CONFIRM and press submit')
        .setStyle(1)
        .setMinLength(7)
        .setMaxLength(7)
        .setRequired(true)
    const row1 = new ActionRowBuilder().addComponents([input1]);
    modal.addComponents(row1);

    await interaction.showModal(modal);
}

// Make sure the user correctly types "confirm" into the confirmation input
async function checkConfirmation(interaction) {
    if (interaction.fields.getTextInputValue('confirmation').toLowerCase() !== 'confirm') {
        interaction.editReply({
            content: `${process.env.BOT_DENY} Purchase failed. Please make sure you type **CONFIRM** into the confirmation box`
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        return false;
    } else {
        return true;
    }
}

// Check user's tokens balance
async function completePurchase(interaction, cost, itemName, customMessage, giftee) {
    const { guild, member, customId } = interaction

    const tokenLog = guild.channels.cache.get(process.env.CREDITLOG_CHAN);
    // Fetch the user's db entry
    const results = await tokensSchema.find({ userId: member.id });
    const tokens = results[0]?.tokens;
    // If the user doesn't have enough tokens to complete the purchase, or if they don't have a db entry yet
    if (results.length === 0) {
        interaction.editReply({
            content: `${process.env.BOT_DENY} You need **${cost}** more tokens to buy **${itemName}**`
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        return false;
    }
    if (tokens < cost) {
        interaction.editReply({
            content: `${process.env.BOT_DENY} You need **${cost - tokens}** more tokens to buy **${itemName}**`
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        return false;
    }
    // Deduct cost from user's tokens
    await dbUpdateOne(tokensSchema, { userId: member.id }, { tokens: tokens - cost });
    // Log when a user's tokens increase or decrease
    if (customId.includes('gift')) {
        tokenLog.send({
            content: `${process.env.TOKENS_GIFT} ${member} gifted ${giftee} **${itemName}** for **${cost}** tokens, they now have **${tokens - cost}** tokens`
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
    } else {
        tokenLog.send({
            content: `${process.env.TOKENS_BUY} ${member} spent **${cost}** tokens to buy **${itemName}**, they now have **${tokens - cost}** tokens`,
            allowedMentions: {
                parse: []
            }
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
    }
    // Confirmation
    interaction.editReply({
        content: `${process.env.BOT_CONF} Purchase approved! ${customMessage}`
    }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));

    return true;
}

module.exports = {
    confirmationModal,
    checkConfirmation,
    completePurchase
}