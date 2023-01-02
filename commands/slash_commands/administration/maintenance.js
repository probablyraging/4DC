const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const path = require('path');

module.exports = {
    name: 'maintenance',
    description: 'Locks specific channels while the bot is under maintenance',
    defaultMemberPermissions: ['Administrator'],
    cooldown: 0,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `option`,
        description: `Start or stop maintenance`,
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [{ name: 'Start', value: 'start' },
        { name: 'End', value: 'end' }]
    }],
    /**
    * @param {CommandInteraction} interaction
    */
    async execute(interaction, client) {
        const { guild, options } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const channelIds = ['1038766290246062100', '851584454036029441', '896069772624683018'];

        switch (options.getString('option')) {
            case 'start': {
                for (const i in channelIds) {
                    const channel = guild.channels.cache.get(channelIds[i]);
                    channel.permissionOverwrites.edit(guild.id, {
                        SendMessages: false,
                    }).catch(err => { return console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err) });
                    channel.send({
                        content: `:warning: This channel is temporarily locked while the bot is under maintenance and will be back shortly`
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                }
                interaction.editReply({ content: 'Maintenance started' }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                break;
            }
        }

        switch (options.getString('option')) {
            case 'end': {
                for (const i in channelIds) {
                    const channel = guild.channels.cache.get(channelIds[i]);
                    channel.permissionOverwrites.edit(guild.id, {
                        SendMessages: null,
                    }).catch(err => { return console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err) });
                    (await channel.messages.fetch({ limit: 10 })).forEach(message => {
                        if (message.author.bot && message.content.includes('maintenance')) {
                            message.delete().catch(err => { return console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err) });
                        }
                    });
                }
                interaction.editReply({ content: 'Maintenance ended' }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                break;
            }
        }
    }
}