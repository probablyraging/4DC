const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");
const { sendResponse } = require('../../../utils/utils');
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
        const option = options.getString('option');

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        // Only allow solved and closed to be ran in threads channels in the help and advice forum
        if (!channel.isThread()) return sendResponse(interaction, `${process.env.BOT_DENY} This is not a thread channel`);

        // If not deleting a thread and the channel is not in the help and advice forum
        if (option !== 'delete' && channel.parentId !== process.env.HELP_CHAN)
            return sendResponse(interaction, `${process.env.BOT_DENY} This command can only be used in a <#${process.env.HELP_CHAN}> thread`);

        switch (option) {
            case 'solved': {
                // Get the current channel tags, keep only the last 5 tags and add the solved tag
                const tagsToApply = [...channel.appliedTags, '1033879593775538196'].slice(-5);
                // Close and mark thread as solved
                const channelName = channel.name.slice(0, 90);
                await channel.edit({
                    name: `[SOLVED] ${channelName}`,
                    appliedTags: tagsToApply,
                    archived: true,
                    locked: true
                });
                sendResponse(interaction, `${process.env.BOT_CONF} Thread has been closed and marked as solved`);
                break;
            }

            case 'close': {
                // Close the thread
                await channel.edit({ archived: true, locked: true });
                sendResponse(interaction, `${process.env.BOT_CONF} Thread has been closed`);
                break;
            }

            case 'delete': {
                // Delete the channel
                await channel.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a thread: `, err));
                // If a thread owner is found, send them a notification
                const threadOwner = await guild.members.fetch(channel.ownerId);
                if (threadOwner) {
                    await threadOwner.send({
                        content: `Your <#1052096719778762822> thread has been deleted as it did not follow the channel guidelines. Please make sure you read the guidelines before creating a new thread`
                    }).catch(() => {
                        // If there was an issue sending the thread owner a notification
                        sendResponse(interaction, `${process.env.BOT_CONF} Thread deleted \nI was unable to send ${threadOwner.user.tag} a DM. They may no longer be in the server`);
                    });
                }
                sendResponse(interaction, `${process.env.BOT_CONF} Thread deleted`);
                break;
            }
        }
    }
}