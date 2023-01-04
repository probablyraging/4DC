const { CommandInteraction, ApplicationCommandType, ActionRowBuilder, TextInputBuilder, ModalBuilder } = require('discord.js');
const { sendReply } = require('../../../utils/utils');

module.exports = {
    name: `Ban`,
    defaultMemberPermissions: ['ModerateMembers'],
    cooldown: 30,
    type: ApplicationCommandType.User,
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const target = await interaction.guild.members.fetch(interaction.targetId).catch(() => { });
        
        // If no target
        if (!target) return sendReply(interaction, `${process.env.BOT_DENY} This user no longer exists`);

        const modal = new ModalBuilder()
            .setTitle(`Ban ${target.user.tag}`)
            .setCustomId('ban-modal')

        const input1 = new TextInputBuilder()
            .setCustomId('input1')
            .setLabel('User id')
            .setStyle(1)
            .setValue(`${target.user.id}`)
            .setMinLength(1)
            .setMaxLength(54)
            .setRequired(true)

        const input2 = new TextInputBuilder()
            .setCustomId('input2')
            .setLabel('Reason')
            .setStyle(2)
            .setMinLength(1)
            .setMaxLength(512)
            .setRequired(true)

        const row1 = new ActionRowBuilder().addComponents([input1]);
        const row2 = new ActionRowBuilder().addComponents([input2]);

        modal.addComponents(row1, row2);

        await interaction.showModal(modal);
    }
}