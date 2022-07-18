const { ContextMenuInteraction, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const path = require('path');

module.exports = {
    name: `invite`,
    description: `Provides a working invite URL for you to invite friends and family`,
    access: '',
    cooldown: 5,
    type: ApplicationCommandType.ChatInput,
    usage: `/invite`,
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    execute(interaction) {
        const { guild } = interaction;

        interaction.reply({
            content: `:busts_in_silhouette: Invite friends to the server with this link - https://discord.gg/${guild.vanityURLCode}`,
            ephemeral: true
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));        
    }
}