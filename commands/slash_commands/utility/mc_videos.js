require("dotenv").config();
const { getVideosSinceLastProof, getLatestVideoTs, isAway } = require("../../../modules/mods_choice/mods_choice_data");
const { delayBetweenVideos, maxMessageLength, maxLengthMessage } = require("../../../modules/mods_choice/mods_choice_constants");
const { msToHumanTime } = require("../../../modules/mods_choice/mods_choice_utils");

module.exports = {
    name: `ccvideos`,
    description: `Get Creator Crew videos that have been posted since you last posted a proof picture`,
    access: '',
    cooldown: 60,
    type: `CHAT_INPUT`,
    usage: `/ccvideos`,
    /**
     * @param {ContextMenuInteraction} interaction
     */
    async execute(interaction) {
        const { channel, member } = interaction;
        // const modsChoiceChannel = guild.channels.cache.get(process.env.MCHOICE_CHAN);

        // make sure we only use this command in the #mods-choice channel
        // if (channel.id !== process.env.MCHOICE_CHAN && !member.permissions.has("MANAGE_MESSAGES")) {
        //     return interaction.reply({
        //         content: `${process.env.BOT_DENY} \`You can only use this command in\` ${modsChoiceChannel}`,
        //         ephemeral: true
        //     }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        // }

        await interaction.deferReply({ ephemeral: true });

        let videosSinceLastProof = await getVideosSinceLastProof(member.id);
        // Build the main section of the reply
        let videoReply;
        if (videosSinceLastProof.length === 0) {
            videoReply = "No videos were found since you last posted proof.";
        } else {
            videoReply = `Below are the videos that you need to watch since you last posted proof: `;
            for (let i = 0; i < videosSinceLastProof.length; i++) {
                let link = videosSinceLastProof[i];
                let toAppend = `\n> ${i + 1}: <` + link + ">";
                // We remove 120 chars for the message about how much time is left before posting - this is variable length, but below 120 chars
                if ((videoReply.length + toAppend.length) < (maxMessageLength - maxLengthMessage.length - 120)) {
                    videoReply += toAppend;
                } else {
                    videoReply += maxLengthMessage;
                    break;
                }
            }
        }
        // Add the time remaining until the user can post another video
        let latestVideoTs = await getLatestVideoTs(member.id);
        let waitUntil = new Date(latestVideoTs + delayBetweenVideos);
        let timeRemaining = (waitUntil - new Date()).valueOf();
        if (timeRemaining > 0) {
            videoReply = videoReply + `\nYou must wait ${msToHumanTime(timeRemaining)} before posting another video to ${channel}.`
        } else {
            videoReply = videoReply + `\nYou can post another video to ${channel}.`
        }
        await interaction.editReply(videoReply)
            .catch(err => console.error("There was a problem replying to the interaction: ", err));
    }
};
