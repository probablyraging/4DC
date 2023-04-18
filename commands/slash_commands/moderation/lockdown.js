const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { sendResponse } = require('../../../utils/utils');
const path = require('path');

module.exports = {
    name: `lockdown`,
    description: `Prevent everyone from sending messages in all channels`,
    defaultMemberPermissions: ['ManageRoles'],
    cooldown: 3,
    dm_permission: false,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `option`,
        description: `Start or stop lockdown`,
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [{ name: 'Start', value: 'start' },
        { name: 'End', value: 'end' }]
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { guild, options } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const noticeChan = guild.channels.cache.get(process.env.GENERAL_CHAN);
        const everyone = guild.roles.cache.get(process.env.GUILD_ID);

        switch (options.getString('option')) {
            case 'start': {
                everyone.edit({
                    permissions: ['ViewChannel', 'AddReactions', 'ReadMessageHistory']
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                noticeChan.send({
                    content: `# :warning: SERVER LOCKDOWN STARTED - all server actions are being temporarily restricted`
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

                sendResponse(interaction, `${process.env.BOT_CONF} Lockdown started`);
                break;
            }

            case 'end': {
                everyone.edit({
                    permissions: ['ViewChannel', 'CreateInstantInvite', 'SendMessages', 'SendMessagesInThreads', 'EmbedLinks', 'AttachFiles', 'AddReactions', 'UseExternalEmojis', 'UseExternalStickers', 'ReadMessageHistory', 'UseApplicationCommands', 'Connect', 'Speak', 'Stream', 'UseVAD']
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                const messages = await noticeChan.messages.fetch({ limit: 10 });
                const messageFound = messages.find(m => m.author.id === client.user.id && m.content.includes('lockdown'));
                if (messageFound) await messageFound.delete().catch(err => console.error(`There was a problem deleting a message: `, err));

                sendResponse(interaction, `${process.env.BOT_CONF} Lockdown ended`);
                break;
            }
        }
    }
}