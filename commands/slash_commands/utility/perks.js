import { CommandInteraction, ApplicationCommandType } from 'discord.js';
import path from 'path';

export default {
    name: `perks`,
    description: `Provides information about the current server subscriber and booster perks`,
    cooldown: 5,
    dm_permission: false,
    type: ApplicationCommandType.ChatInput,
    /**
     * @param {CommandInteraction} interaction 
     */
    execute(interaction) {
        const img = './res/images/supporter_rewards.png';
        interaction.reply({
            files: [img],
            ephemeral: true
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
    }
}