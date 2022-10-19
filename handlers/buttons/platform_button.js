const path = require('path');

module.exports = async (interaction) => {
    const { member, customId } = interaction;

    const roleTwitch = process.env.PLATFORM_TWITCH;
    const roleYouTube = process.env.PLATFORM_YOUTUBE;
    const roleInstagram = process.env.PLATFORM_INSTAGRAM;
    const roleTikTok = process.env.PLATFORM_TIKTOK;
    const roleSnapchat = process.env.PLATFORM_SNAPCHAT;
    const roleSpotify = process.env.PLATFORM_SPOTIFY;
    const roleSoundCloud = process.env.PLATFORM_SOUNDCLOUD;
    const roleDeveloper = process.env.PLATFORM_DEVELOPER;
    const roleWriter = process.env.PLATFORM_WRITER;
    const roleMusician = process.env.PLATFORM_MUSICIAN;
    const rolePhotographer = process.env.PLATFORM_PHOTOGRAPHER;

    await interaction.deferUpdate();
    // await interaction.deferReply({ ephemeral: true });

    if (customId.split('-')[1] === 'twitch') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleTwitch)) {
            member?.roles?.remove(roleTwitch).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            // interaction.editReply({ content: `Role ${customId.split('-')[1].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            member?.roles?.add(roleTwitch).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            // interaction.editReply({ content: `Role ${customId.split('-')[1].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }

    if (customId.split('-')[1] === 'youtube') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleYouTube)) {
            member?.roles?.remove(roleYouTube).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            // interaction.editReply({ content: `Role ${customId.split('-')[1].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            member?.roles?.add(roleYouTube).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            // interaction.editReply({ content: `Role ${customId.split('-')[1].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }

    if (customId.split('-')[1] === 'instagram') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleInstagram)) {
            member?.roles?.remove(roleInstagram).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            // interaction.editReply({ content: `Role ${customId.split('-')[1].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            member?.roles?.add(roleInstagram).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            // interaction.editReply({ content: `Role ${customId.split('-')[1].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }

    if (customId.split('-')[1] === 'tiktok') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleTikTok)) {
            member?.roles?.remove(roleTikTok).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            // interaction.editReply({ content: `Role ${customId.split('-')[1].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            member?.roles?.add(roleTikTok).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            // interaction.editReply({ content: `Role ${customId.split('-')[1].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }

    if (customId.split('-')[1] === 'snapchat') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleSnapchat)) {
            member?.roles?.remove(roleSnapchat).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            // interaction.editReply({ content: `Role ${customId.split('-')[1].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            member?.roles?.add(roleSnapchat).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            // interaction.editReply({ content: `Role ${customId.split('-')[1].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }

    if (customId.split('-')[1] === 'spotify') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleSpotify)) {
            member?.roles?.remove(roleSpotify).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            // interaction.editReply({ content: `Role ${customId.split('-')[1].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            member?.roles?.add(roleSpotify).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            // interaction.editReply({ content: `Role ${customId.split('-')[1].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }

    if (customId.split('-')[1] === 'soundcloud') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleSoundCloud)) {
            member?.roles?.remove(roleSoundCloud).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            // interaction.editReply({ content: `Role ${customId.split('-')[1].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            member?.roles?.add(roleSoundCloud).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            // interaction.editReply({ content: `Role ${customId.split('-')[1].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }

    if (customId.split('-')[1] === 'developer') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleDeveloper)) {
            member?.roles?.remove(roleDeveloper).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            // interaction.editReply({ content: `Role ${customId.split('-')[1].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            member?.roles?.add(roleDeveloper).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            // interaction.editReply({ content: `Role ${customId.split('-')[1].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }

    if (customId.split('-')[1] === 'writer') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleWriter)) {
            member?.roles?.remove(roleWriter).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            // interaction.editReply({ content: `Role ${customId.split('-')[1].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            member?.roles?.add(roleWriter).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            // interaction.editReply({ content: `Role ${customId.split('-')[1].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }

    if (customId.split('-')[1] === 'musician') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(roleMusician)) {
            member?.roles?.remove(roleMusician).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            // interaction.editReply({ content: `Role ${customId.split('-')[1].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            member?.roles?.add(roleMusician).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            // interaction.editReply({ content: `Role ${customId.split('-')[1].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }

    if (customId.split('-')[1] === 'photographer') {
        // If user already has this role, remove it
        if (member?.roles?.cache.has(rolePhotographer)) {
            member?.roles?.remove(rolePhotographer).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
            // interaction.editReply({ content: `Role ${customId.split('-')[1].toUpperCase()} removed`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        } else {
            member?.roles?.add(rolePhotographer).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a user's role: `, err));
            // interaction.editReply({ content: `Role ${customId.split('-')[1].toUpperCase()} added`, ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }
    }
}