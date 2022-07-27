const { ContextMenuInteraction, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
require("dotenv").config();

module.exports = {
    name: `ccvideos`,
    description: `Get Creator Crew videos that have been posted since you last posted a proof picture`,
    access: '',
    cooldown: 60,
    type: ApplicationCommandType.ChatInput,
    usage: `/ccvideos`,
    /**
     * @param {ContextMenuInteraction} interaction
     */
    async execute(interaction) {
        const { channel, member } = interaction;

        interaction.reply({
            content: `Creator Crew videos have moved to the Dashboard at **<https://www.forthecontent.xyz/creatorcrew>**
You no longer need to use this command, you can visit the Dashboard directly`,
            ephemeral: true
        })
    }
};
