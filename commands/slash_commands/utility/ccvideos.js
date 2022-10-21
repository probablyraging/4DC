const { ContextMenuInteraction, ApplicationCommandType } = require('discord.js');
require("dotenv").config();

module.exports = {
    name: `ccvideos`,
    description: ``,
    cooldown: 60,
    type: ApplicationCommandType.ChatInput,
    /**
     * @param {ContextMenuInteraction} interaction
     */
    async execute(interaction) {
        interaction.reply({
            content: `Creator Crew videos have moved to the Dashboard at **<https://www.forthecontent.xyz/creatorcrew>**
You no longer need to use this command, you can visit the Dashboard directly`,
            ephemeral: true
        })
    }
};
