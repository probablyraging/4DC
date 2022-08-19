const { ContextMenuInteraction, ApplicationCommandType, EmbedBuilder, ApplicationCommandOptionType, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: `test`,
    description: `dummy command`,
    cooldown: 0,
    type: ApplicationCommandType.ChatInput,
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction, client) {
        const { options, member, guild, channel } = interaction;

        const btnCustoms = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('custom-announcements')
                    .setLabel('Announcements')
                    .setEmoji('🙋‍♂️')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('custom-deals')
                    .setLabel('Game Deals')
                    .setEmoji('🙋‍♀️')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('custom-bump')
                    .setLabel('Bump Ping')
                    .setEmoji('🙋')
                    .setStyle(ButtonStyle.Secondary)
            );

        interaction.reply({ content: 'ok', components: [btnCustoms] })
    }
}