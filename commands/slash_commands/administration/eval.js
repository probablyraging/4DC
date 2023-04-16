const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, codeBlock } = require("discord.js");
const { sendResponse } = require("../../../utils/utils");
const path = require("path");

module.exports = {
    name: `eval`,
    description: `Evaluate code from within Discord`,
    defaultMemberPermissions: ['Administrator'],
    cooldown: 0,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `code`,
        description: `Code to be evaluated`,
        type: ApplicationCommandOptionType.String,
        required: true,
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { options } = interaction;

        await interaction.deferReply().catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const code = options.getString('code');
        const initReply = `Evaluating ${codeBlock(code)}`;

        sendResponse(interaction, initReply);

        try {
            await eval(code);
        } catch (error) {
            return sendResponse(interaction, `${initReply} \nError ${codeBlock(error)}`);
        }
    }
}