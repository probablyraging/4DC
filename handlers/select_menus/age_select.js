const { ages } = require('../../lists/roles-ids');
const path = require('path');

module.exports = async (interaction) => {
    const { member, values } = interaction;

    const roleAgeOne = process.env.AGE_ONE;
    const roleAgeTwo = process.env.AGE_TWO;
    const roleAgeThree = process.env.AGE_THREE;

    await interaction.deferReply({ ephemeral: true });

    if (values[0] === '13-17') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleAgeOne)) {
            member?.roles?.remove(roleAgeOne).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            // Remove all other color roles before adding a new one
            ages.forEach(roleId => {
                member?.roles?.remove(roleId).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            });
            member?.roles?.add(roleAgeOne).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }

    if (values[0] === '18-29') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleAgeTwo)) {
            member?.roles?.remove(roleAgeTwo).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            // Remove all other color roles before adding a new one
            ages.forEach(roleId => {
                member?.roles?.remove(roleId).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            });
            member?.roles?.add(roleAgeTwo).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }

    if (values[0] === '30+') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleAgeThree)) {
            member?.roles?.remove(roleAgeThree).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            // Remove all other color roles before adding a new one
            ages.forEach(roleId => {
                member?.roles?.remove(roleId).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            });
            member?.roles?.add(roleAgeThree).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }
}