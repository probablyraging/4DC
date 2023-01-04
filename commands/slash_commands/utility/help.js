const { CommandInteraction, ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { sendResponse } = require('../../../utils/utils');
const path = require('path');

module.exports = {
    name: `help`,
    description: `Help system for 4DC and the ForTheContent server`,
    cooldown: 5,
    type: ApplicationCommandType.ChatInput,
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { member } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const embed = new EmbedBuilder()
            .setColor('#5865f2')
            .setTitle('Home')
            .setDescription(`Use the buttons below to access help menus for 4DC and ForTheContent's features`)

            const btn = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('help-home')
                    .setLabel('Home')
                    .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                    .setCustomId('help-games')
                    .setLabel('Games')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('help-tokens')
                    .setLabel('Tokens')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('help-delete')
                    .setLabel('Delete')
                    .setStyle(ButtonStyle.Danger)
            );

        // Send the user a DM containing the help embed
        let error;
        await member.send({
            embeds: [embed],
            components: [btn]
        }).catch(() => { error = true });
        // If an error occurs, the user needs to enable DMs
        if (error) {
            return sendResponse(interaction, `To view the help menu, please enable your DMs. To do this, go to **User Settings > Privacy & Safety > Allow direct messages from server members**. Once you have enabled DMs, click the continue button below`);
        } else {
            interaction.deleteReply().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting an interaction: `, err));
        }
    }
}