const { ContextMenuInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const path = require('path');

module.exports = {
    name: `claim`,
    description: `Claim a super secret reward`,
    cooldown: 5,
    type: ApplicationCommandType.ChatInput,
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    execute(interaction) {
        const { guild, member, options } = interaction;
        interaction.reply({
            content: `Aww shucks! Unfortunately all 5 of the super secret rewards have already been claimed by other people. In fact, you just missed out by *2.7 seconds*
            
Continue counting to 20,000 for another chance to win a super secret reward, and better luck next time, squirt`,
            ephemeral: true,
            allowedMentions: {
                parse: []
            }
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
    }
}