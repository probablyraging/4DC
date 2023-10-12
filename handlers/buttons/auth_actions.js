const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const path = require('path');

module.exports = async (interaction) => {
    const { customId, member } = interaction;

    let buttonType = false;
    let repeats = 0;

    function randomButtonType() {
        if (!buttonType) {
            // If a random button wasn't chosen, force the last button type to be Success
            if (repeats >= 5) return 3;
            // Decide if we should randomize this button type or now
            const buttonChooser = Math.floor(Math.random() * 3) + 1;
            if (buttonChooser === 1) {
                repeats++;
                return 1
            };
            // Get random number between 1 and 6 - 2=Success
            const buttonTypeChooser = Math.floor(Math.random() * 2) + 1;
            if (buttonTypeChooser === 2) {
                buttonType = true;
                return 3;
            } else {
                repeats++;
                return 1;
            }
        } else {
            return 1;
        }
    }

    const rowOne = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('auth-one')
                .setLabel('⠀')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('auth-two')
                .setLabel('⠀')
                .setStyle(randomButtonType()),
            new ButtonBuilder()
                .setCustomId('auth-three')
                .setLabel('⠀')
                .setStyle(randomButtonType()),
            new ButtonBuilder()
                .setCustomId('auth-four')
                .setLabel('⠀')
                .setStyle(ButtonStyle.Primary)
        );

    const rowTwo = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('auth-five')
                .setLabel('⠀')
                .setStyle(randomButtonType()),
            new ButtonBuilder()
                .setCustomId('auth-six')
                .setLabel('⠀')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('auth-seven')
                .setLabel('⠀')
                .setStyle(randomButtonType()),
            new ButtonBuilder()
                .setCustomId('auth-eight')
                .setLabel('⠀')
                .setStyle(ButtonStyle.Primary)
        );

    const rowThree = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('auth-nine')
                .setLabel('⠀')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('auth-ten')
                .setLabel('⠀')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('auth-eleven')
                .setLabel('⠀')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('auth-twelve')
                .setLabel('⠀')
                .setStyle(ButtonStyle.Primary)
        );

    const rowFour = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('auth-thirteen')
                .setLabel('⠀')
                .setStyle(randomButtonType()),
            new ButtonBuilder()
                .setCustomId('auth-fourteen')
                .setLabel('⠀')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('auth-fifteen')
                .setLabel('⠀')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('auth-sixteen')
                .setLabel('⠀')
                .setStyle(randomButtonType())
        );

    // Auth Start
    if (customId.split('-')[1] === 'start') {
        try {
            await interaction.deferReply({ ephemeral: true });
            interaction.followUp({ content: `Click the **GREEN** button below`, components: [rowOne, rowTwo, rowThree, rowFour], ephemeral: true });
        } catch (err) {
            console.log('There was a problem with the verification initiation: ', err);
        }
    }

    // Auth Answer
    if (customId.split('-')[1] !== 'start') {
        try {
            if (interaction.component.data.style === 3) {
                await interaction.deferUpdate();
                interaction.editReply({ content: `${process.env.BOT_CONF} Verification successful`, components: [] });
                // Give member role
                member.roles.add(process.env.MEMBER_ROLE);
            } else {
                await interaction.deferUpdate();
                interaction.editReply({ content: `${process.env.BOT_DENY} Verification failed. Please try again.`, components: [] });
            }
        } catch (err) {
            console.log('There was a problem verifying a user: ', err);
        }
    }
}