import { CommandInteraction, ApplicationCommandType } from 'discord.js';

export default {
    name: `invite`,
    description: `Provides a working invite URL for you to invite friends and family`,
    cooldown: 5,
    dm_permission: false,
    type: ApplicationCommandType.ChatInput,
    /**
     * @param {CommandInteraction} interaction 
     */
    execute(interaction) {
        const { guild } = interaction;
        interaction.reply({
            content: `:busts_in_silhouette: Invite friends to the server with this link - https://discord.gg/${guild.vanityURLCode}`,
            ephemeral: true
        }).catch(err => console.error(`There was a problem sending an interaction: `, err));
    }
}