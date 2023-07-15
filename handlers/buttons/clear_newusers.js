const { sendResponse, dbDeleteMany } = require('../../utils/utils');
const newUsersSchema = require('../../schemas/misc/new_users');
const path = require('path');

module.exports = async (interaction) => {
    await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

    await dbDeleteMany(newUsersSchema, { userId: { $exists: true } });

    sendResponse(interaction, `New user list cleared successfully!`);
}