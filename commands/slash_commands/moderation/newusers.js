const { CommandInteraction, ApplicationCommandType, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { sendResponse } = require('../../../utils/utils');
const { dbFind, dbUpdateOne } = require('../../../utils/utils');
const newUsersScheme = require('../../../schemas/misc/new_users');
const path = require('path');

module.exports = {
    name: `newusers`,
    description: `Get a list of recent new users`,
    defaultMemberPermissions: ['ModerateMembers'],
    cooldown: 5,
    dm_permission: false,
    type: ApplicationCommandType.ChatInput,
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { member } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const results = await dbFind(newUsersScheme);
        const lcTimestamp = results.filter(result => result.lastCheckedTimestamp)[0]?.lastCheckedTimestamp;
        const lcUser = results.filter(result => result.lastCheckedUser)[0]?.lastCheckedUser;
        const newUsersArr = results.filter(result => result.userId).map(result => `<@${result.userId}>`);
        const newUsersFormatted = newUsersArr.length > 0 ? newUsersArr.join('\n') : 'No new users';
        const response = lcTimestamp ? newUsersFormatted + `\n\n Last checked by <@${lcUser}> <t:${lcTimestamp}:R>` : newUsersFormatted + `\n\n Not checked today`;

        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('clearnewusers')
                    .setLabel('Clear List Once All User Have Been Checked')
                    .setStyle(ButtonStyle.Danger)
            );

        await sendResponse(interaction, response, [], [], newUsersArr.length > 0 ? [button] : []);

        await dbUpdateOne(newUsersScheme, { lastCheckedTimestamp: { $exists: true } }, { $set: { lastCheckedTimestamp: Math.round(new Date() / 1000) } });
        await dbUpdateOne(newUsersScheme, { lastCheckedUser: { $exists: true } }, { $set: { lastCheckedUser: member.id } });
    }
}