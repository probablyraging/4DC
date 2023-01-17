const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { sendResponse } = require('../../../utils/utils');
const captchaMap = new Map();
const newUsers = new Set();

function randomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const phrases = ['Red Moon', 'Yellow Sunrise', 'Green Fields', 'Indigo Night', 'Violet Sky'];

module.exports = async (interaction) => {
    const { member, customId } = interaction;

    await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

    if (customId === 'verify') {
        // Pick a random phrase for the user to verify with
        const designatedCaptchaPhrase = phrases[randomNum(0, phrases.length - 1)];
        // Designate the user a specific phrase to verify with
        captchaMap.set(member.id, designatedCaptchaPhrase);

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('captcha')
                    .setPlaceholder('Select Captcha')
                    .addOptions(
                        { label: 'Red Moon', value: '0', },
                        { label: 'Yellow Sunrise', value: '1', },
                        { label: 'Green Fields', value: '2', },
                        { label: 'Indigo Night', value: '3', },
                        { label: 'Violet Sky', value: '4', }
                    )
            );

        await interaction.editReply({ content: `⠀\nPlease select the **${designatedCaptchaPhrase}** option from the select menu below\n⠀`, components: [row] });
    }

    if (customId === 'captcha') {
        const userSelectedCaptchaPhrase = phrases[interaction.values[0]];
        // Get the users designated captcha phrase
        const designatedCaptchaPhrase = captchaMap.get(member.id);
        // Make sure the user selects the correct phrase
        if (userSelectedCaptchaPhrase === designatedCaptchaPhrase) {
            // Remove the unverified role from the user
            member.roles.remove(process.env.UNVERIFIED_ROLE).catch(err => console.error(err));
            sendResponse(interaction, `${process.env.BOT_CONF} Sucessfully verified`);
            // Once a user is verified, add them to the newUser set (Extends welcome_check.js)
            newUsers.add(member.id);
            // Remove user from map
            captchaMap.delete(member.id);
        } else {
            sendResponse(interaction, `${process.env.BOT_DENY} Incorrect captcha, please try again`);
        }
    }

}

module.exports.newUsers = newUsers;