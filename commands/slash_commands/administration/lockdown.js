const { ContextMenuInteraction } = require('discord.js');
const path = require('path');

module.exports = {
    name: `lockdown`,
    description: `Prevent everyone from sending messages in all channels`,
    permission: `MANAGE_MESSAGES`,
    type: `CHAT_INPUT`,
    options: [{
        name: `start`,
        description: `Start a lockdown`,
        type: `SUB_COMMAND`,
        usage: `/lockdown start [reason]`,
        options: [{
            name: `reason`,
            description: `Provide a reason for the lockdown`,
            type: `STRING`,
            required: true
        }],
    },
    {
        name: `end`,
        description: `End a lockdown`,
        type: `SUB_COMMAND`,
        usage: `/lockdown end`,
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    execute(interaction) {
        const { member, guild, options } = interaction;

        const reason = options.getString('reason');

        const noticeChan = guild.channels.cache.get(process.env.GENERAL_CHAN);
        const everyone = guild.roles.cache.get(process.env.GUILD_ID);

        if (member.id !== process.env.OWNER_ID) {
            return interaction.reply({
                content: `${process.env.BOT_DENY} \`You don't have access to this command\``,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }

        try {
            switch (options.getSubcommand()) {
                case 'start': {
                    everyone.edit({
                        permissions: ['VIEW_CHANNEL', 'CREATE_INSTANT_INVITE', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY']
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                    noticeChan.send({
                        content: `${process.env.BOT_DENY} \`SERVER LOCKDOWN STARTED\`
                        
**Reason**
\`\`\`${reason}\`\`\``
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

                    interaction.reply({
                        content: `${process.env.BOT_CONF} \`Done\``,
                        ephemeral: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                }
            }

            switch (options.getSubcommand()) {
                case 'end': {
                    everyone.edit({
                        permissions: ['VIEW_CHANNEL', 'CREATE_INSTANT_INVITE', 'SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'USE_EXTERNAL_STICKERS', 'READ_MESSAGE_HISTORY', 'USE_APPLICATION_COMMANDS', 'CONNECT', 'SPEAK', 'STREAM', 'USE_VAD']
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                    noticeChan.send({
                        content: `${process.env.BOT_CONF} \`A SERVER LOCKDOWN HAD ENDED\``
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

                    interaction.reply({
                        content: `${process.env.BOT_CONF} \`Done\``,
                        ephemeral: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                }
            }
        } catch (err) {
            console.error(err);
        }
    }
}