const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { sendResponse, dbUpdateOne } = require('../../../utils/utils');
const guardiansSchema = require('../../../schemas/misc/guardians_schema');
const path = require('path');

module.exports = {
    name: `grant`,
    description: `Grant users permission to the supporter content channel`,
    defaultMemberPermissions: ['ManageRoles'],
    cooldown: 3,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `user`,
        description: `The user to grant access`,
        type: ApplicationCommandOptionType.User,
        required: true
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { guild, options } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const target = options.getMember('user');
        const guardianRole =  guild.roles.cache.get('1068065444935766046');

        if (!target) return sendResponse(interaction, `${process.env.BOT_DENY} This user is no longer in the server`);

        const myDate = new Date();
        const addOneWeek = myDate.getTime() + (24 * 7 * 60 * 60 * 1000);

        target.roles.add(guardianRole).catch(() => {
            return sendResponse(interaction, `${process.env.BOT_DENY} There was a problem adding the guardian role to the user. You may need to do it manually`);
        }).then(async () => {
            await dbUpdateOne(guardiansSchema, { userId: target?.id }, { timestamp: addOneWeek });
            sendResponse(interaction, `${process.env.BOT_CONF} ${target} has been added to ${guardianRole}`);
        });
        
    }
}