const { EmbedBuilder } = require('discord.js');
const { sendResponse } = require('../../utils/utils');
const path = require('path');

module.exports = async (interaction) => {
    await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

    // Initial embed and buttons
    const embed = new EmbedBuilder()
        .setColor('#5865f2')
        .setTitle('Premium Ad Information')
        .setDescription(`Select from the following options`)
        .addFields(
            {
                name: `Ad Duration`,
                value: `<:minidot:923683258871472248> 1 Week - **$5**
<:minidot:923683258871472248> 1 Month - **$15** *(save $5) **recommended***
<:minidot:923683258871472248> 3 Month - **$45** *(save $15)*
<:minidot:923683258871472248> 6 Month - **$80** *(save $40)*
*..custom durations can be arranged*`,
                inline: false
            },
            {
                name: `Role Pings`,
                value: `<:minidot:923683258871472248> @everyone Role Ping - **$10** **recommended**
<:minidot:923683258871472248> @here Role Ping - **$7**
<:minidot:923683258871472248> Specific Role Ping - **$3** per role`,
                inline: false
            },
            {
                name: `Optional Extras`,
                value: `<:minidot:923683258871472248> Own Custom Channel - **$5**
<:minidot:923683258871472248> Re-Ping Role - **$3-$10**
<:minidot:923683258871472248> Bump Ad To Bottom - **$1**
<:minidot:923683258871472248> Additional Links - **$1**

*Prices are USD*
*One link per ad spot*
*PayPal only*`,
                inline: false
            })

    sendResponse(interaction, ``, [embed]);
}