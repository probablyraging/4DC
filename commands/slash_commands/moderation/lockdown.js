const { ContextMenuInteraction, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
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
        type: ApplicationCommandOptionType.Subcommand,
        options: [{
            name: `reason`,
            description: `Provide a reason for the lockdown`,
            type: ApplicationCommandOptionType.String,
            required: true
        }],
    },
    {
        name: `end`,
        description: `End a lockdown`,
        type: ApplicationCommandOptionType.Subcommand,
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    execute(interaction) {
        const { guild, options } = interaction;

        const reason = options.getString('reason');

        const noticeChan = guild.channels.cache.get(process.env.GENERAL_CHAN);
        const everyone = guild.roles.cache.get(process.env.GUILD_ID);

        switch (options.getSubcommand()) {
            case 'start': {
                everyone.edit({
                    permissions: ['ViewChannel', 'CreateInstantInvite', 'AddReactions', 'ReadMessageHistory']
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                noticeChan.send({
                    content: `${process.env.BOT_DENY} SERVER LOCKDOWN STARTED
                        
**Reason**
\`\`\`${reason}\`\`\``
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

                interaction.reply({
                    content: `${process.env.BOT_CONF} Done`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                break;
            }

            case 'end': {
                everyone.edit({
                    permissions: ['ViewChannel', 'CreateInstantInvite', 'SendMessages', 'EmbedLinks', 'AttachFiles', 'AddReactions', 'UseExternalEmojis', 'UseExternalStickers', 'ReadMessageHistory', 'UseApplicationCommands', 'Connect', 'Spead', 'Stream', 'UseVAD']
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                noticeChan.send({
                    content: `${process.env.BOT_CONF} A SERVER LOCKDOWN HAD ENDED`
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

                interaction.reply({
                    content: `${process.env.BOT_CONF} Done`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                break;
            }
        }
    }
}