const { genders } = require('../../lists/roles-ids');
const path = require('path');

module.exports = async (interaction) => {
    const { member, values } = interaction;

    const roleMale = process.env.GENDER_MALE;
    const roleFemale = process.env.GENDER_FEMALE;
    const roleOther = process.env.GENDER_OTHER;

    await interaction.deferReply({ ephemeral: true });

    if (values[0] === 'male') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleMale)) {
            member?.roles?.remove(roleMale).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            // Remove all other color roles before adding a new one
            genders.forEach(roleId => {
                member?.roles?.remove(roleId).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            });
            member?.roles?.add(roleMale).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }

    if (values[0] === 'female') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleFemale)) {
            member?.roles?.remove(roleFemale).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            // Remove all other color roles before adding a new one
            genders.forEach(roleId => {
                member?.roles?.remove(roleId).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            });
            member?.roles?.add(roleFemale).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }

    if (values[0] === 'non-binary') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleOther)) {
            member?.roles?.remove(roleOther).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            // Remove all other color roles before adding a new one
            genders.forEach(roleId => {
                member?.roles?.remove(roleId).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            });
            member?.roles?.add(roleOther).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }
}