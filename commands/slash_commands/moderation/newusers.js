const { CommandInteraction, ApplicationCommandType } = require('discord.js');
const { sendResponse } = require('../../../utils/utils');
const { dbFind } = require('../../../utils/utils');
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
        const { member, guild, options } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const results = await dbFind(newUsersScheme);
        const newUsersArr = results.map(result => `<@${result.userId}>`);
        const newUsersFormatted = newUsersArr.length > 0 ? newUsersArr.join('\n') : 'No new users';

        sendResponse(interaction, newUsersFormatted);
    }
}