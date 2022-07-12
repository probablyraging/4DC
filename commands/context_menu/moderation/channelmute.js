const { ContextMenuInteraction, MessageActionRow, TextInputComponent, Modal } = require('discord.js');
const path = require('path');

module.exports = {
    name: `Channel Mute`,
    description: ``,
    cooldown: 5,
    type: `MESSAGE`,
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { channel } = interaction;

        const fetchMsg = await channel.messages.fetch(interaction.targetId);
        const target = fetchMsg.author;

        const modal = new Modal()
            .setTitle('Channel Mute')
            .setCustomId('channel-mute-modal')

        const input1 = new TextInputComponent()
            .setCustomId('input1')
            .setLabel('Username')
            .setStyle(1)
            .setValue(`${target?.tag}`)
            .setMinLength(1)
            .setMaxLength(54)
            .setRequired(true)

        const input2 = new TextInputComponent()
            .setCustomId('input2')
            .setLabel('Reason for muting')
            .setStyle(2)
            .setMinLength(1)
            .setMaxLength(512)
            .setRequired(true)

        const row1 = new MessageActionRow().addComponents([input1]);
        const row2 = new MessageActionRow().addComponents([input2]);

        modal.addComponents(row1, row2);

        await interaction.showModal(modal);
    }
}