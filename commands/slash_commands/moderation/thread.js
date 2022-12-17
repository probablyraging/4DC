const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");
const path = require('path');

module.exports = {
    name: `thread`,
    description: `Mark a help and advice thread as solved or closed`,
    defaultMemberPermissions: ['Administrator'],
    cooldown: 0,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `option`,
        description: `Chose to mark the thread as solved or closed`,
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [{ name: 'Solved', value: 'solved' },
        { name: 'Close', value: 'close' },
        { name: 'Delete Commission Thread', value: 'delete' }]
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { guild, options, channel } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        // Only allow solved and closed to be ran in threads channels in the help and advice forum
        if (!channel.isThread()) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} This is not a thread channel`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }
        if (options.getString('option') !== 'delete' && channel.parentId !== process.env.HELP_CHAN) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} This command can only be used in a <#${process.env.HELP_CHAN}> thread`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }

        switch (options.getString('option')) {
            case 'solved': {
                // Get the array of current channel tags and push the solved tag
                let tagsToApply = channel.appliedTags;
                tagsToApply.push('1033879593775538196');
                // Threads can only have a max of 5 tags, so we shift the array until only 5 tags remain
                while (tagsToApply.length > 5) {
                    tagsToApply.shift();
                }
                // Thread names can only be 100 chars long
                let channelName = channel.name;
                if (channelName.length >= 90) channelName = channel.name.slice(0, 90);
                (await channel.setName(`[SOLVED] ${channelName}`)).edit({ appliedTags: tagsToApply, archived: true, locked: true });
                interaction.editReply({
                    content: `${process.env.BOT_CONF} Thread has been closed and marked as solved`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                break;
            }

            case 'close': {
                await channel.edit({ archived: true, locked: true });
                interaction.editReply({
                    content: `${process.env.BOT_CONF} Thread has been closed`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                break;
            }

            case 'delete': {
                const threadOwner = await guild.members.fetch(channel.ownerId);
                if (!threadOwner) {
                    return interaction.editReply({
                        content: `${process.env.BOT_DENY} The owner of this thread is no longer in the server`
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                }
                await threadOwner.send({
                    content: `Your <#1052096719778762822> thread has been deleted as it did not follow the channel guidelines. Please make sure you read the guidelines before creating a new thread`
                }).catch(() => {
                    interaction.editReply({
                        content: `${process.env.BOT_CONF} Thread deleted \nI was unable to send ${threadOwner.user.tag} a DM`
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                });
                await channel.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a thread: `, err));
                break;
            }
        }
    }
}