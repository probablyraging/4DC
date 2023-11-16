const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, codeBlock } = require("discord.js");
const { sendResponse } = require('../../../utils/utils');
const { default: axios } = require("axios");
const path = require('path');

/**
 * Extracts the YouTube video ID from a given string.
 * @param {string} string The input string that may contain a YouTube video ID or URL
 * @returns {string|null} The YouTube video ID if found, or null if not found
 */
function getYoutubeVideoId(string) {
    if (!string) return;
    string = string.replace(/&\S*|&$/g, '');
    // Check if the input string matches the video ID pattern
    const videoIdPattern = /^[\w\-_]{11}$/;
    if (videoIdPattern.test(string)) {
        return string;
    }
    // Otherwise, match http/https and youtu.be, youtube.com, and youtube.com/shorts/
    const urlPattern = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/|be\.com\/shorts\/)([\w\-_]*)(?:&t=[\dhms]+)?/i;
    // The execution of this regex returns the first YouTube video ID, or null
    const matchArray = urlPattern.exec(string);
    if (matchArray) {
        return matchArray[1];
    }
    // If no match is found, return null
    return null;
}

module.exports = {
    name: "distubify",
    description: "Subcommands for Distubify",
    cooldown: 15,
    dm_permission: false,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: `submit`,
            description: `Submit a video to Distubify`,
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: "video",
                description: "Video URL or ID (e.g.: https://www.youtube.com/watch?v=dQw4w9WgXcQ or dQw4w9WgXcQ)",
                type: ApplicationCommandOptionType.String,
                required: true
            }],
        }
    ],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { guild, options, member } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const submissionChan = guild.channels.cache.get('1173833323135651850');
        const video = options.getString('video');
        const videoId = getYoutubeVideoId(video);

        const response = await axios.post('https://creatordiscord.xyz/api/addvideo_youtube', { data: video });

        if (response.data.message) {
            sendResponse(interaction, `${process.env.BOT_CONF} ${response.data.message}`);
            submissionChan.send({
                content: `**${member} posted a new video on Distubify - https://youtu.be/${videoId}**`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
        } else {
            sendResponse(interaction, `${process.env.BOT_DENY} ${response.data.error}`);
        }
    }
};
