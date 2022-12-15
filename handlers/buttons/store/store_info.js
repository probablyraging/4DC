const { CommandInteraction, EmbedBuilder, codeBlock } = require("discord.js");
const path = require('path');

/**
 * @param {CommandInteraction} interaction 
 */
module.exports = async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    let embed = new EmbedBuilder()
        .setColor('#5865f2')

    // Perm
    if (interaction.customId === 'info-perm-one') {
        embed.setTitle('Twitch Auto')
        embed.addFields({ name: `Description`, value: codeBlock(`4DC will automatically share your Twitch stream links in the #content-share channel when you go live`), inline: false },
            { name: `Expires`, value: codeBlock(`Never`), inline: false })
        embed.setImage('https://i.imgur.com/83N3K8p.png')

        interaction.editReply({
            embeds: [embed]
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
    }

    if (interaction.customId === 'info-perm-two') {
        embed.setTitle('YouTube Auto')
        embed.addFields({ name: `Description`, value: codeBlock(`4DC will automatically share your YouTube video links in the #content-share channel when you upload them`), inline: false },
            { name: `Expires`, value: codeBlock(`Never`), inline: false })
        embed.setImage('https://i.imgur.com/b3ZnRoN.png')

        interaction.editReply({
            embeds: [embed]
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
    }

    if (interaction.customId === 'info-perm-three') {
        embed.setTitle('Link Embeds')
        embed.addFields({ name: `Description`, value: codeBlock(`Includes a link preview embed when you share a link in the #content-share channel`), inline: false },
            { name: `Expires`, value: codeBlock(`Never`), inline: false })
        embed.setImage('https://i.imgur.com/XAl7IYn.png')

        interaction.editReply({
            embeds: [embed]
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
    }

    // Temp
    if (interaction.customId === 'info-temp-one') {
        embed.setTitle('Twitch Auto')
        embed.addFields({ name: `Description`, value: codeBlock(`4DC will automatically share your Twitch stream links in the #content-share channel when you go live`), inline: false },
            { name: `Expires`, value: codeBlock(`1 week`), inline: false })
        embed.setImage('https://i.imgur.com/83N3K8p.png')

        interaction.editReply({
            embeds: [embed]
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
    }

    if (interaction.customId === 'info-temp-two') {
        embed.setTitle('YouTube Auto')
        embed.addFields({ name: `Description`, value: codeBlock(`4DC will automatically share your YouTube video links in the #content-share channel when you upload them`), inline: false },
            { name: `Expires`, value: codeBlock(`1 week`), inline: false })
        embed.setImage('https://i.imgur.com/b3ZnRoN.png')

        interaction.editReply({
            embeds: [embed]
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
    }

    if (interaction.customId === 'info-temp-three') {
        embed.setTitle('Link Embeds')
        embed.addFields({ name: `Description`, value: codeBlock(`Includes a link preview embed when you share a link in the #content-share channel`), inline: false },
            { name: `Expires`, value: codeBlock(`1 week`), inline: false })
        embed.setImage('https://i.imgur.com/XAl7IYn.png')

        interaction.editReply({
            embeds: [embed]
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
    }

    // Misc
    if (interaction.customId === 'info-misc-one') {
        embed.setTitle('Double XP')
        embed.addFields({ name: `Description`, value: codeBlock(`Earn double XP towards your rank while you chat`), inline: false },
            { name: `Expires`, value: codeBlock(`1 week`), inline: false })

        interaction.editReply({
            embeds: [embed]
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
    }

    if (interaction.customId === 'info-misc-two') {
        embed.setTitle('Game Saves')
        embed.addFields({ name: `Description`, value: codeBlock(`Buy up to 2 personal saves for the counting game`), inline: false },
            { name: `Expires`, value: codeBlock(`When used as a save`), inline: false })

        interaction.editReply({
            embeds: [embed]
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
    }

    if (interaction.customId === 'info-misc-three') {
        embed.setTitle('Spotlight Tickets')
        embed.addFields({ name: `Description`, value: codeBlock(`Buy entry tickets to get your content featured in the #content-spotlight channel for 24 hours`), inline: false },
            { name: `Expires`, value: codeBlock(`24 hours`), inline: false })

        interaction.editReply({
            embeds: [embed]
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
    }
}