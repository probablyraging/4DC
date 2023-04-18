const { CommandInteraction, ApplicationCommandType, AutoModerationRuleEventType, AutoModerationRuleTriggerType, AutoModerationActionType } = require("discord.js");
const { sendResponse } = require('../../../utils/utils');
const path = require("path");

module.exports = {
    name: `automoddelete`,
    description: `Delete an AutoMod rule`,
    defaultMemberPermissions: ['Administrator'],
    cooldown: 0,
    global: true,
    dm_permission: false,
    type: ApplicationCommandType.ChatInput,
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { guild} = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const autmodRules = await guild.autoModerationRules.fetch();

        autmodRules.forEach(rule => {
            if (rule.name === 'Test') {
                guild.autoModerationRules.delete(rule.id);
            }
        })

        sendResponse(interaction, `Done`);
    }
}