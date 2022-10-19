const { ContextMenuInteraction, ApplicationCommandType } = require("discord.js");

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
    }
}