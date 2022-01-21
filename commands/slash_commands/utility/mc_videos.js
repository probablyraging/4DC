require("dotenv").config();
const {getVideosSinceLastProof, getLatestVideoTs} = require("../../../modules/mods_choice/mods_choice_data");
const {delayBetweenVideos} = require("../../../modules/mods_choice/mods_choice_constants");
const {msToHumanTime} = require("../../../modules/mods_choice/mods_choice_utils");

module.exports = {
    name: `mcvideos`,
    description: `Get Mods Choice videos that have been posted since you last posted a proof picture`,
    permission: ``,
    cooldown: 60,
    type: `CHAT_INPUT`,
    usage: `/mcvideos`,
    /**
     * @param {ContextMenuInteraction} interaction
     */
    async execute(interaction) {
        const {guild, channel, member} = interaction;
        const modsChoiceChannel = guild.channels.cache.get(process.env.MCHOICE_CHAN);

        // make sure we only use this command in the #mods-choice channel
        if (channel.id !== process.env.MCHOICE_CHAN && !member.permissions.has("MANAGE_MESSAGES")) {
            return interaction.reply({
                content: `${process.env.BOT_DENY} \`You can only use this command in\` ${modsChoiceChannel}`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }

        await interaction.deferReply({ephemeral: true});

        let videosSinceLastProof = await getVideosSinceLastProof(member.id);
        if (videosSinceLastProof.length === 0) {
            await interaction.editReply(`No videos were found since you last posted proof.`).catch(err => console.error("There was a problem replying to the interaction: ", err));
        } else {
            let latestVideoTs = await getLatestVideoTs(member.id);
            let waitUntil = new Date(latestVideoTs + delayBetweenVideos);
            let timeRemaining = (waitUntil - new Date()).valueOf();
            let videoReply = `Below are the ${videosSinceLastProof.length} videos that you need to watch since you last posted proof: `;
            videosSinceLastProof.forEach(link => {
                videoReply = videoReply + "\n> <" + link + ">";
            });
            if (timeRemaining > 0) {
                videoReply = videoReply + `\nYou must wait ${msToHumanTime(timeRemaining)} before posting another video to ${channel}.`
            } else {
                videoReply = videoReply + `\nYou can post another video to ${channel}.`
            }
            await interaction.editReply(videoReply)
                .catch(err => console.error("There was a problem replying to the interaction: ", err));
        }
    }
};
