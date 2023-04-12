const { CommandInteraction, ApplicationCommandType } = require("discord.js");
const { sendResponse } = require('../../../utils/utils');
const path = require("path");

module.exports = {
    name: `automodfetch`,
    description: `Fetch AutoMod rules`,
    defaultMemberPermissions: ['Administrator'],
    cooldown: 0,
    type: ApplicationCommandType.ChatInput,
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction, client) {
        const { options, member, guild, channel, user } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const autmodRules = await guild.autoModerationRules.fetch();

        let automodRuleNames = [];
        autmodRules.forEach(rule => {
            automodRuleNames.push(rule.name);
        })

        sendResponse(interaction, `${automodRuleNames}`);
    }
}