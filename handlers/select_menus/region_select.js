const { regions } = require('../../lists/roles-ids');
const path = require('path');

module.exports = async (interaction) => {
    const { member, values } = interaction;

    const roleAmerica = process.env.REGION_AMERICA;
    const roleEurope = process.env.REGION_EUROPE;
    const roleOceania = process.env.REGION_OCEANIA;
    const roleAsia = process.env.REGION_ASIA;

    await interaction.deferReply({ ephemeral: true });

    if (values[0] === 'america') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleAmerica)) {
            member?.roles?.remove(roleAmerica).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            // Remove all other color roles before adding a new one
            regions.forEach(roleId => {
                member?.roles?.remove(roleId).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            });
            member?.roles?.add(roleAmerica).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }

    if (values[0] === 'europe') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleEurope)) {
            member?.roles?.remove(roleEurope).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            // Remove all other color roles before adding a new one
            regions.forEach(roleId => {
                member?.roles?.remove(roleId).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            });
            member?.roles?.add(roleEurope).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }

    if (values[0] === 'oceania') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleOceania)) {
            member?.roles?.remove(roleOceania).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            // Remove all other color roles before adding a new one
            regions.forEach(roleId => {
                member?.roles?.remove(roleId).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            });
            member?.roles?.add(roleOceania).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }

    if (values[0] === 'asia') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleAsia)) {
            member?.roles?.remove(roleAsia).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            // Remove all other color roles before adding a new one
            regions.forEach(roleId => {
                member?.roles?.remove(roleId).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            });
            member?.roles?.add(roleAsia).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }
}