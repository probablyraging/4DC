const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { sendResponse } = require('../../../utils/utils');
const path = require('path');

module.exports = {
    name: `lockdown`,
    description: `Prevent everyone from sending messages in all channels`,
    defaultMemberPermissions: ['ManageRoles'],
    cooldown: 3,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `start`,
        description: `Start a lockdown`,
        type: ApplicationCommandOptionType.Subcommand
    },
    {
        name: `end`,
        description: `End a lockdown`,
        type: ApplicationCommandOptionType.Subcommand,
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { guild, options } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const noticeChan = guild.channels.cache.get(process.env.GENERAL_CHAN);
        const everyone = guild.roles.cache.get(process.env.GUILD_ID);

        switch (options.getSubcommand()) {
            case 'start': {
                everyone.edit({
                    permissions: ['ViewChannel', 'CreateInstantInvite', 'AddReactions', 'ReadMessageHistory']
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                noticeChan.send({
                    content: `${process.env.BOT_DENY} SERVER LOCKDOWN STARTED`
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

                sendResponse(interaction, `${process.env.BOT_CONF} Lockdown started`);
                break;
            }

            case 'end': {
                everyone.edit({
                    permissions: ['ViewChannel', 'CreateInstantInvite', 'SendMessages', 'EmbedLinks', 'AttachFiles', 'AddReactions', 'UseExternalEmojis', 'UseExternalStickers', 'ReadMessageHistory', 'UseApplicationCommands', 'Connect', 'Spead', 'Stream', 'UseVAD']
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                noticeChan.send({
                    content: `${process.env.BOT_CONF} SERVER LOCKDOWN HAD ENDED`
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

                sendResponse(interaction, `${process.env.BOT_CONF} Lockdown ended`);
                break;
            }
        }
    }
}