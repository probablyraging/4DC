const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { dbUpdateOne, sendResponse } = require('../../../utils/utils');
const rankSchema = require('../../../schemas/misc/rank_schema');
const path = require('path');

module.exports = {
    name: `xp`,
    description: `Reset a user's XP`,
    defaultMemberPermissions: ['ManageRoles'],
    cooldown: 30,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `reset`,
        description: `Reset a user's XP`,
        type: ApplicationCommandOptionType.Subcommand,
        options: [{
            name: `username`,
            description: `The user whos XP you want to reset`,
            type: ApplicationCommandOptionType.User,
            required: true
        }],
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { member, options } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const target = options.getMember('username');

        // Don't allow the user running the command to add/remove/reset themselves
        if (target?.id === member?.id) return sendResponse(interaction, `${process.env.BOT_DENY} You can't edit your own XP`);

        switch (options.getSubcommand()) {
            case 'reset': {
                const results = await rankSchema.find({ id: target?.id }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
                // If no user matching the target's ID was found in the database
                if (results.length === 0) return sendResponse(interaction, `${process.env.BOT_DENY} I could not find that user in the rank database`);                
                // Reset the user's rank data to 0
                await dbUpdateOne(rankSchema, { id: target?.id }, { level: 0, rank: 0, msgCount: 0, xp: 0, xxp: 0, xxxp: 0 });

                sendResponse(interaction, `${process.env.BOT_CONF} ${target}'s rank data has been reset`)
            }
        }
    }
}