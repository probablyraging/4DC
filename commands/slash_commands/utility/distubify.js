const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");
const { sendResponse } = require('../../../utils/utils');
const { default: axios } = require("axios");
const path = require('path');

module.exports = {
    name: "distubify",
    description: "Subcommands for Distubify",
    cooldown: 15,
    dm_permission: false,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `platform`,
        description: `Choose a platform`,
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [{ name: 'YouTube', value: '1' },
        { name: 'Twitch', value: '2' }]
    }, {
        name: "video",
        description: "Video URL or ID (e.g.: youtube.com/watch?v=dQw4w9WgXcQ or twitch.tv/videos/93659204226)",
        type: ApplicationCommandOptionType.String,
        required: true
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { options } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const platform = options.getString('platform');
        const video = options.getString('video');

        if (platform === '1') {
            const response = await axios.post('https://creatordiscord.xyz/api/addvideo_youtube', { data: video });
            if (response.data.message) {
                sendResponse(interaction, `${process.env.BOT_CONF} ${response.data.message}`);
            } else {
                sendResponse(interaction, `${process.env.BOT_DENY} ${response.data.error}`);
            }
        } else if (platform === '2') {
            const response = await axios.post('https://creatordiscord.xyz/api/addvideo_twitch', { data: video });
            if (response.data.message) {
                sendResponse(interaction, `${process.env.BOT_CONF} ${response.data.message}`);
            } else {
                sendResponse(interaction, `${process.env.BOT_DENY} ${response.data.error}`);
            }
        }
    }
};
