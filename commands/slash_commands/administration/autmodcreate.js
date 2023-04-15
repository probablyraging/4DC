const { CommandInteraction, ApplicationCommandType, AutoModerationRuleEventType, AutoModerationRuleTriggerType, AutoModerationActionType } = require("discord.js");
const { sendResponse } = require('../../../utils/utils');
const path = require("path");

module.exports = {
    name: `automodcreate`,
    description: `Create a new AutoMod rule`,
    defaultMemberPermissions: ['Administrator'],
    cooldown: 0,
    dm_permission: false,
    type: ApplicationCommandType.ChatInput,
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction, client) {
        const { options, member, guild, channel, user } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        await guild.autoModerationRules.create({
            name: 'Test',
            eventType: AutoModerationRuleEventType.MessageSend,
            triggerType: AutoModerationRuleTriggerType.Keyword,
            triggerMetadata: {
                keywordFilter: ['chickeedeedoodledum']
            },
            actions: [{
                type: AutoModerationActionType.SendAlertMessage,
                metadata: {
                    channel: channel
                }
            }]
        });

        sendResponse(interaction, `Done`);
    }
}