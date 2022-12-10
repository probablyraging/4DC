const { ActionRowBuilder, TextInputBuilder, ModalBuilder } = require("discord.js");
const tokensSchema = require('../../../schemas/misc/tokens_schema');
const path = require('path');

// Modal to confirm purchase
async function confirmationModal(interaction, storeName, itemName, itemIndex, cost) {
    const modal = new ModalBuilder()
        .setTitle(`${itemName}`)
        .setCustomId(`${storeName}-${itemIndex}-confirm`)
    // YouTube Auto
    const input2 = new TextInputBuilder()
        .setCustomId('input2')
        .setLabel(`YouTube Channel ID`)
        .setStyle(1)
        .setMinLength(1)
        .setMaxLength(56)
        .setRequired(true)
    const row2 = new ActionRowBuilder().addComponents([input2]);
    if (interaction.customId === 'storecommon-two' || interaction.customId === 'storerare-three') modal.addComponents(row2);
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
    if (interaction.customId === 'storecommon-five') modal.addComponents(row3);
    const input4 = new TextInputBuilder()
        .setCustomId('input4')
        .setLabel(`Message`)
        .setStyle(2)
        .setMinLength(1)
        .setMaxLength(1024)
        .setRequired(true)
    const row4 = new ActionRowBuilder().addComponents([input4]);
    if (interaction.customId === 'storecommon-five') modal.addComponents(row4);
    const input7 = new TextInputBuilder()
        .setCustomId('input7')
        .setLabel(`Content URL`)
        .setStyle(1)
        .setMinLength(1)
        .setMaxLength(1024)
        .setRequired(true)
    const row7 = new ActionRowBuilder().addComponents([input7]);
    if (interaction.customId === 'storecommon-five') modal.addComponents(row7);
    // Custom Role
    const input5 = new TextInputBuilder()
        .setCustomId('input5')
        .setLabel(`Role Name`)
        .setStyle(1)
        .setMinLength(1)
        .setMaxLength(64)
        .setRequired(true)
    const row5 = new ActionRowBuilder().addComponents([input5]);
    if (interaction.customId === 'storerare-six' || interaction.customId === 'storelegendary-six') modal.addComponents(row5);
    const input6 = new TextInputBuilder()
        .setCustomId('input6')
        .setLabel(`Role Color`)
        .setPlaceholder('Must be a HEX color (e.g. #F4F4F4)')
        .setStyle(1)
        .setMinLength(7)
        .setMaxLength(7)
        .setRequired(false)
    const row6 = new ActionRowBuilder().addComponents([input6]);
    if (interaction.customId === 'storerare-six' || interaction.customId === 'storelegendary-six') modal.addComponents(row6);
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
async function completePurchase(interaction, cost, itemName, customMessage) {
    const { guild, member } = interaction

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
    await tokensSchema.updateOne({
        userId: member.id
    }, {
        tokens: tokens - cost,
    }, {
        upsert: true
    }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
    // Log when a user's tokens increase or decrease
    tokenLog.send({
        content: `${process.env.TOKENS_BUY} ${member} spent **${cost}** tokens to buy **${itemName}**
${process.env.TOKENS_DOWN} ${member} lossed **${cost}** while shopping, they now have **${tokens - cost}** tokens`,
        allowedMentions: {
            parse: []
        }
    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
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