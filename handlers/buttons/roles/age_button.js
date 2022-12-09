const { ages } = require('../../../lists/roles-ids');
const path = require('path');

module.exports = async (interaction) => {
    const { member, customId } = interaction;

    const roleAgeOne = process.env.AGE_ONE;
    const roleAgeTwo = process.env.AGE_TWO;
    const roleAgeThree = process.env.AGE_THREE;

    await interaction.deferUpdate();

    if (customId.split('-')[1] === 'groupone') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleAgeOne)) {
            member?.roles?.remove(roleAgeOne).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
        } else {
            // Remove all other color roles before adding a new one
            ages.forEach(roleId => {
                member?.roles?.remove(roleId).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            });
            member?.roles?.add(roleAgeOne).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
        }
    }

    if (customId.split('-')[1] === 'grouptwo') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleAgeTwo)) {
            member?.roles?.remove(roleAgeTwo).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
        } else {
            // Remove all other color roles before adding a new one
            ages.forEach(roleId => {
                member?.roles?.remove(roleId).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            });
            member?.roles?.add(roleAgeTwo).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
        }
    }

    if (customId.split('-')[1] === 'groupthree') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleAgeThree)) {
            member?.roles?.remove(roleAgeThree).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
        } else {
            // Remove all other color roles before adding a new one
            ages.forEach(roleId => {
                member?.roles?.remove(roleId).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            });
            member?.roles?.add(roleAgeThree).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
        }
    }
}