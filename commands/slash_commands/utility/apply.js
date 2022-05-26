const { ContextMenuInteraction } = require('discord.js');

module.exports = {
    name: `apply`,
    description: `Apply for a staff role`,
    access: '',
    cooldown: 86400,
    type: `CHAT_INPUT`,
    usage: `/apply`,
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        
        interaction.reply({
            content: `To apply for a staff position, please [click here](https://www.creatorhub.info/apply) to fill out the form`,
            ephemeral: true
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
    }
}