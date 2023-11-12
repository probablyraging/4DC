const { CommandInteraction, ApplicationCommandType } = require('discord.js');
const { sendResponse } = require('../../../utils/utils');
const path = require('path');

module.exports = {
    name: `extension`,
    description: `Get information about the ForTheContent browser extension`,
    cooldown: 5,
    dm_permission: false,
    type: ApplicationCommandType.ChatInput,
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        sendResponse(interaction, `The ForTheContent browser extension gives users the opportunity to showcase their YouTube videos to an engaged audience

Through this extension, your videos can receive likes, views, and watch time. Here's how it works:

1. Download the browser extension by [clicking here](<https://chrome.google.com/webstore/detail/kbnghoajbjomkegkhiiafelmmecnajhd>)
2. Earn 5 tokens by watching other user's videos for a minimum of 10 minutes each *(1 video = 1 token)* 
3. Use your 5 earned tokens to submit your own video for other users to watch and like

A full guide can be found at: <https://creatordiscord.xyz/extguide>`);
    }
}