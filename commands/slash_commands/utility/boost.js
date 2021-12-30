const { ContextMenuInteraction } = require('discord.js');
const path = require('path');

module.exports = {
    name: `boost`,
    description: `Provides information about the current server booster perks`,
    permission: ``,
    cooldown: 5,
    type: `CHAT_INPUT`,
    usage: `/boost`,
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    execute(interaction) {
        const { } = interaction;

        const img = 'https://www.weebly.com/editor/uploads/1/2/6/0/126006118/custom_themes/656977109613806662/files/images/CHBoostRewards.png';

        interaction.reply({
            files: [img],
            ephemeral: true
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
    }
}