const { colors } = require('../../lists/roles-ids');
const path = require('path');

module.exports = async (interaction) => {
    const { member, values } = interaction;

    const roleBlue = process.env.NICKNAME_BLUE;
    const roleRed = process.env.NICKNAME_RED;
    const roleGreen = process.env.NICKNAME_GREEN;
    const roleOrange = process.env.NICKNAME_ORANGE;
    const roleYellow = process.env.NICKNAME_YELLOW;
    const rolePink = process.env.NICKNAME_PINK;
    const rolePurple = process.env.NICKNAME_PURPLE;

    await interaction.deferReply({ ephemeral: true });

    if (values[0] === 'blue') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleBlue)) {
            member?.roles?.remove(roleBlue).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            // Remove all other color roles before adding a new one
            colors.forEach(roleId => {
                member?.roles?.remove(roleId).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            });
            member?.roles?.add(roleBlue).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }

    if (values[0] === 'red') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleRed)) {
            member?.roles?.remove(roleRed).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            // Remove all other color roles before adding a new one
            colors.forEach(roleId => {
                member?.roles?.remove(roleId).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            });
            member?.roles?.add(roleRed).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }

    if (values[0] === 'green') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleGreen)) {
            member?.roles?.remove(roleGreen).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            // Remove all other color roles before adding a new one
            colors.forEach(roleId => {
                member?.roles?.remove(roleId).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            });
            member?.roles?.add(roleGreen).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }

    if (values[0] === 'orange') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleOrange)) {
            member?.roles?.remove(roleOrange).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            // Remove all other color roles before adding a new one
            colors.forEach(roleId => {
                member?.roles?.remove(roleId).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            });
            member?.roles?.add(roleOrange).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }

    if (values[0] === 'yellow') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleYellow)) {
            member?.roles?.remove(roleYellow).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            // Remove all other color roles before adding a new one
            colors.forEach(roleId => {
                member?.roles?.remove(roleId).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            });
            member?.roles?.add(roleYellow).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }

    if (values[0] === 'pink') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(rolePink)) {
            member?.roles?.remove(rolePink).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            // Remove all other color roles before adding a new one
            colors.forEach(roleId => {
                member?.roles?.remove(roleId).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            });
            member?.roles?.add(rolePink).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }

    if (values[0] === 'purple') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(rolePurple)) {
            member?.roles?.remove(rolePurple).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            // Remove all other color roles before adding a new one
            colors.forEach(roleId => {
                member?.roles?.remove(roleId).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            });
            member?.roles?.add(rolePurple).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }
}