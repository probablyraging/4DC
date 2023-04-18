const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");
const { sendResponse } = require('../../../utils/utils');
const path = require('path');

module.exports = {
    name: `thread`,
    description: `Mark a help and advice thread as solved or closed`,
    defaultMemberPermissions: ['Administrator'],
    cooldown: 0,
    dm_permission: false,
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

        switch (option) {
            case 'delete': {
                // If a thread owner is found, send them a notification
                const threadOwner = await guild.members.fetch(channel.ownerId).catch(() => {});
                if (threadOwner) {
                    await threadOwner.send({
                        content: `Your <#1052096719778762822> thread has been deleted as it did not follow the channel guidelines. Please make sure you read the guidelines before creating a new thread`
                    }).catch(async () => {
                        // If there was an issue sending the thread owner a notification
                        await sendResponse(interaction, `${process.env.BOT_CONF} Thread deleted \nI was unable to send ${threadOwner.user.tag} a DM`);
                    });
                }
                await sendResponse(interaction, `${process.env.BOT_CONF} Thread deleted`);
                // Delete the channel
                channel.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a thread: `, err));
                break;
            }
        }
    }
}