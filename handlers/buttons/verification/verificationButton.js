const { sendResponse } = require('../../../utils/utils');

module.exports = async (interaction) => {
    const { member } = interaction;

    await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));
    // Check if the user's verification status is pending or not
    if (member.pending === false) {
        member.roles.remove(process.env.UNVERIFIED_ROLE).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role to a user: `, err));
        interaction.deleteReply().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a reply: `, err));
    }
}