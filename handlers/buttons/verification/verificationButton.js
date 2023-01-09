const { sendResponse } = require('../../../utils/utils');

module.exports = async (interaction) => {
    const { member } = interaction;

    try {
        await interaction.deferReply({ ephemeral: true });
        // Check if the user's verification status is pending or not
        if (member.pending === false)
            member.roles.remove(process.env.UNVERIFIED_ROLE) && interaction.deleteReply();
    } catch (err) {
        console.error('There was a problem with verificationButton: ', err);
    }
}