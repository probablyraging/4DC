require("dotenv").config();
const {getWarnedUsersProof} = require("../../../modules/mods_choice/mods_choice_data")
const {msToHumanTime} = require("../../../modules/mods_choice/mods_choice_utils");

module.exports = {
    name: `mcaudit`,
    description: `Get an audit of the Mods Choice channel`,
    permission: `MODERATE_MEMBERS`,
    cooldown: 3,
    type: `CHAT_INPUT`,
    usage: `/mcaudit`,
    /**
     * @param {ContextMenuInteraction} interaction
     */
    async execute(interaction) {
        const {guild} = interaction;

        await interaction.deferReply({ephemeral: true});

        let proofArray = await getWarnedUsersProof();
        if (proofArray.length === 0) {
            await interaction.editReply("No users are currently warned.")
                .catch(err => console.error("There was a problem replying to the interaction: ", err));
        } else {
            let responseMessage = "The current users have active warnings:";
            proofArray.forEach(proof => {
                let guildMember = guild.members.cache.get(proof.author);
                let timeSinceLastPost = msToHumanTime(new Date() - proof.proofTs);
                let timesWarned = proof.missedCount;
                responseMessage = responseMessage + `\n${guildMember} has not posted proof in the last ${timeSinceLastPost}. They have been warned ${timesWarned} time(s).`;
            });
            await interaction.editReply(responseMessage)
                .catch(err => console.error("There was a problem replying to the interaction: ", err));
        }
    }
};
