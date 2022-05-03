require("dotenv").config();
const {getWarnedUsersProof} = require("../../../modules/mods_choice/mods_choice_data");
const {getWarnings} = require("../../../modules/mods_choice/mods_choice_warning_data");
const {msToHumanTime} = require("../../../modules/mods_choice/mods_choice_utils");

module.exports = {
    name: `mcaudit`,
    description: `Get an audit of the Mods Choice channel`,
    access: 'staff',
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
            await interaction.editReply("All users are up to date with posting screenshots.")
                .catch(err => console.error("There was a problem replying to the interaction: ", err));
        } else {
            let responseMessage = "The current users have not posted in 3+ days:";
            for (const proof of proofArray) {
                let guildMember = guild.members.cache.get(proof.author);
                let warnings = await getWarnings(proof.author);
                let timeSinceLastPost = msToHumanTime(new Date() - proof.proofTs);
                let timesWarned = proof.missedCount;
                responseMessage = responseMessage + `\n> ${guildMember} has not posted proof in the last ${timeSinceLastPost}. They have missed posting ${timesWarned} time(s). They have ${warnings.length} warning(s).`;
            }
            await interaction.editReply(responseMessage)
                .catch(err => console.error("There was a problem replying to the interaction: ", err));
        }
    }
};
