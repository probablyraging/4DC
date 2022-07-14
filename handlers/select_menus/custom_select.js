const { customs } = require('../../lists/roles-ids');
const path = require('path');

module.exports = async (interaction) => {
    const { member, values } = interaction;

    const roleAnnouncement = process.env.CUSTOM_ANNOUNCEMENT;
    const roleDeals = process.env.CUSTOM_DEALS;
    const roleBump = process.env.CUSTOM_BUMP;

    await interaction.deferUpdate();
    // await interaction.deferReply({ ephemeral: true });

    if (values[0] === 'announcements') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleAnnouncement)) {
            member?.roles?.remove(roleAnnouncement).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            // interaction.editReply({ content: `Role ${values[0].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            member?.roles?.add(roleAnnouncement).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            // interaction.editReply({ content: `Role ${values[0].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }

    if (values[0] === 'deals') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleDeals)) {
            member?.roles?.remove(roleDeals).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            // interaction.editReply({ content: `Role ${values[0].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            member?.roles?.add(roleDeals).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            // interaction.editReply({ content: `Role ${values[0].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }

    if (values[0] === 'bump') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleBump)) {
            member?.roles?.remove(roleBump).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            // interaction.editReply({ content: `Role ${values[0].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            member?.roles?.add(roleBump).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            // interaction.editReply({ content: `Role ${values[0].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }
}