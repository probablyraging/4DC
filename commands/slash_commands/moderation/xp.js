const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const path = require('path');
const rankSchema = require('../../../schemas/misc/rank_schema');

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

        // dont allow the user running the command to add/remove/reset themselves
        if (target?.id === member?.id) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} You can't edit your own XP`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }

        switch (options.getSubcommand()) {
            case 'reset': {
                // if no user matching the target's ID was found in the database
                const results = await rankSchema.find({ id: target?.id }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));

                if (results.length === 0) {
                    return interaction.reply({
                        content: `${process.env.BOT_DENY} I could not find that user in the rank database`,
                        ephemeral: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                }

                // reset the user's rank data to 0
                await rankSchema.updateOne({
                    id: target?.id
                }, {
                    level: 0,
                    rank: 0,
                    msgCount: 0,
                    xp: 0,
                    xxp: 0,
                    xxxp: 0,
                }, {
                    upsert: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                interaction.editReply({
                    content: `${process.env.BOT_CONF} ${target}'s rank data has been reset`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
            }
        }
    }
}