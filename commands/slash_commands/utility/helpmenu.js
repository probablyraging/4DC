const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, codeBlock } = require("discord.js");
const { sendResponse } = require('../../../utils/utils');
const { commands } = require('../../../lists/help_menu');
const path = require('path');

module.exports = {
    name: `helpmenu`,
    description: `Information about the server and its features`,
    defaultMemberPermissions: ['Administrator'],
    cooldown: 0,
    dm_permission: false,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `query`,
        description: `Query`,
        type: ApplicationCommandOptionType.String,
        autocomplete: true,
        required: true,
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const choices = [];
        for (const key in commands) {
            if (Object.hasOwnProperty.call(commands, key)) {
                choices.push(key);
            }
        }
        const filtered = choices.filter(choice => choice.startsWith(focusedValue));
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        );
    },

    async execute(interaction) {
        const { options } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const embed = new EmbedBuilder()

        const commandKey = options.getString('query');
        if (Object.hasOwnProperty.call(commands, commandKey)) {
            const command = commands[commandKey];
            embed.setTitle(command.name);
            embed.addFields({ name: `Description`, value: command.description },
                { name: `Usage`, value: codeBlock(command.usage) })
        }

        sendResponse(interaction, ``, [embed]);
    }
}