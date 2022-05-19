const { ContextMenuInteraction, MessageActionRow, TextInputComponent, Modal } = require('discord.js');

module.exports = {
    name: `apply`,
    description: `Apply for a staff role`,
    access: '',
    cooldown: 86400,
    type: `CHAT_INPUT`,
    usage: `/apply [age] [country] [reason]`,
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const modal = new Modal()
            .setTitle('Application for CreatorHub Staff')
            .setCustomId('staff-modal')

        const input1 = new TextInputComponent()
            .setCustomId('input1')
            .setLabel('Age')
            .setStyle(1)
            .setPlaceholder('18')
            .setMinLength(1)
            .setMaxLength(2)
            .setRequired(true)

        const input2 = new TextInputComponent()
            .setCustomId('input2')
            .setLabel('Region')
            .setStyle(1)
            .setPlaceholder('Canada')
            .setMinLength(1)
            .setMaxLength(54)
            .setRequired(true)

        const input3 = new TextInputComponent()
            .setCustomId('input3')
            .setLabel('Comments')
            .setStyle(2)
            .setPlaceholder('Tell us about yourself, why you would like to be staff, if you have any previous experience, etc..')
            .setMinLength(1)
            .setMaxLength(1024)
            .setRequired(true)

        const row1 = new MessageActionRow().addComponents([input1]);
        const row2 = new MessageActionRow().addComponents([input2]);
        const row3 = new MessageActionRow().addComponents([input3]);

        modal.addComponents(row1, row2, row3);

        await interaction.showModal(modal);
    }
}