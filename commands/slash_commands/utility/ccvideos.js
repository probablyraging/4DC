const { ContextMenuInteraction, ApplicationCommandType } = require('discord.js');
require("dotenv").config();

module.exports = {
    name: `ccvideos`,
    description: `Get Creator Crew videos that have been posted since you last posted a proof picture`,
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
