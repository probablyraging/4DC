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
        const { options, member, guild, channel, user } = interaction;

        // const btnCustoms = new ActionRowBuilder()
        //     .addComponents(
        //         new ButtonBuilder()
        //             .setCustomId('btn-one')
        //             .setLabel('btn-one')
        //             .setEmoji('🙋‍♂️')
        //             .setStyle(ButtonStyle.Secondary),
        //         new ButtonBuilder()
        //             .setCustomId('btn-two')
        //             .setLabel('btn-two')
        //             .setEmoji('🙋‍♀️')
        //             .setStyle(ButtonStyle.Secondary)
        //     );

        // user.send({ content: 'ok', components: [btnCustoms] })
    }
}