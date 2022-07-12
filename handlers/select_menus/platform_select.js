const { platforms } = require('../../lists/roles-ids');
const path = require('path');

module.exports = async (interaction) => {
    const { member, values } = interaction;

    const roleTwitch = process.env.PLATFORM_TWITCH;
    const roleYouTube = process.env.PLATFORM_YOUTUBE;
    const roleInstagram = process.env.PLATFORM_INSTAGRAM;
    const roleTikTok = process.env.PLATFORM_TIKTOK;

    await interaction.deferReply({ ephemeral: true });

    if (values[0] === 'twitch') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleTwitch)) {
            member?.roles?.remove(roleTwitch).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            member?.roles?.add(roleTwitch).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }

    if (values[0] === 'youtube') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleYouTube)) {
            member?.roles?.remove(roleYouTube).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            member?.roles?.add(roleYouTube).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }

    if (values[0] === 'instagram') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleInstagram)) {
            member?.roles?.remove(roleInstagram).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            member?.roles?.add(roleInstagram).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }

    if (values[0] === 'tiktok') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleTikTok)) {
            member?.roles?.remove(roleTikTok).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            member?.roles?.add(roleTikTok).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            interaction.editReply({ content: `Role ${values[0].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }
}