const { regions } = require('../../lists/roles-ids');
const path = require('path');

module.exports = async (interaction) => {
    const { member, customId } = interaction;

    const roleAmerica = process.env.REGION_AMERICA;
    const roleEurope = process.env.REGION_EUROPE;
    const roleOceania = process.env.REGION_OCEANIA;
    const roleAsia = process.env.REGION_ASIA;
    const roleAfrica = process.env.REGION_AFRICA;

    await interaction.deferUpdate();

    if (customId.split('-')[1] === 'america') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleAmerica)) {
            member?.roles?.remove(roleAmerica).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
        } else {
            // Remove all other color roles before adding a new one
            regions.forEach(roleId => {
                member?.roles?.remove(roleId).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            });
            member?.roles?.add(roleAmerica).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
        }
    }

    if (customId.split('-')[1] === 'europe') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleEurope)) {
            member?.roles?.remove(roleEurope).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
        } else {
            // Remove all other color roles before adding a new one
            regions.forEach(roleId => {
                member?.roles?.remove(roleId).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            });
            member?.roles?.add(roleEurope).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
        }
    }

    if (customId.split('-')[1] === 'oceania') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleOceania)) {
            member?.roles?.remove(roleOceania).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
        } else {
            // Remove all other color roles before adding a new one
            regions.forEach(roleId => {
                member?.roles?.remove(roleId).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            });
            member?.roles?.add(roleOceania).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
        }
    }

    if (customId.split('-')[1] === 'asia') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleAsia)) {
            member?.roles?.remove(roleAsia).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
        } else {
            // Remove all other color roles before adding a new one
            regions.forEach(roleId => {
                member?.roles?.remove(roleId).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            });
            member?.roles?.add(roleAsia).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
        }
    }

    if (customId.split('-')[1] === 'africa') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleAfrica)) {
            member?.roles?.remove(roleAfrica).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
        } else {
            // Remove all other color roles before adding a new one
            regions.forEach(roleId => {
                member?.roles?.remove(roleId).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            });
            member?.roles?.add(roleAfrica).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
        }
    }
}