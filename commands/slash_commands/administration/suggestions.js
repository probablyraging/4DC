const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const path = require('path');

module.exports = {
    name: `suggestions`,
    description: `Approve or deny a suggestions`,
    defaultMemberPermissions: ['Administrator'],
    cooldown: 10,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `choice`,
        description: `Choose to approve or deny the suggestion`,
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [{ name: 'approve', value: 'approve' },
        { name: 'deny', value: 'deny' },
        { name: 'pigeonhole', value: 'pigeonhole' }]
    },
    {
        name: `id`,
        description: `The message ID of the suggestions`,
        type: ApplicationCommandOptionType.String,
        required: true
    },
    {
        name: `response`,
        description: `The approval or denial response to add to the suggestions`,
        type: ApplicationCommandOptionType.String,
        required: true
    }],
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const { guild, options, user } = interaction;
        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const id = options.getString('id');
        const response = options.getString('response');
        const suggestionChannel = guild.channels.cache.get(process.env.SUGGESTIONS_CHAN);
        const message = await suggestionChannel.messages.fetch(id);
        const embed = message?.embeds[0];

        // If the message doesn't contain an embed
        if (!embed) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} This message does not contain a suggestion`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }

        // If the suggestion has already been replied to
        if (embed.footer) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} This suggestion has already been responded to`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }

        // APPROVE
        switch (options.getString('choice')) {
            case 'approve': {
                const responseEmbed = EmbedBuilder.from(embed)
                    .addFields({ name: `Response`, value: `\`\`\`${response}\`\`\`` })
                    .setFooter({ text: `Approved by ${user?.tag}` })
                    .setTimestamp()

                // Edit the existing embed and add the appropriate reaction
                await message.edit({ embeds: [responseEmbed] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an embed: `, err));
                await message.react(`${process.env.BOT_CONF}`).catch(err => console.error(`${path.basename(__filename)} There was a problem reacting to a message: `, err));

                interaction.editReply({
                    content: `${process.env.BOT_CONF} Response added to ${id}`,
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                break;
            }

            // DENY
            case 'deny': {
                const responseEmbed = EmbedBuilder.from(embed)
                    .addFields({ name: `Response`, value: `\`\`\`${response}\`\`\`` })
                    .setFooter({ text: `Denied by ${user?.tag}` })
                    .setTimestamp()

                // Edit the existing embed and add the appropriate reaction
                await message.edit({ embeds: [responseEmbed] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an embed: `, err));
                await message.react(`${process.env.BOT_DENY}`).catch(err => console.error(`${path.basename(__filename)} There was a problem reacting to a message: `, err));

                interaction.editReply({
                    content: `${process.env.BOT_CONF} Response added to ${id}`,
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                break;
            }

            // PIGEONHOLE
            case 'pigeonhole': {
                const responseEmbed = EmbedBuilder.from(embed)
                    .addFields({ name: `Response`, value: `\`\`\`${response}\`\`\`` })
                    .setFooter({ text: `Pigeonholed by ${user?.tag}` })
                    .setTimestamp()

                // Edit the existing embed and add the appropriate reaction
                await message.edit({ embeds: [responseEmbed] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an embed: `, err));
                await message.react(`${process.env.BOT_INFO}`).catch(err => console.error(`${path.basename(__filename)} There was a problem reacting to a message: `, err));

                interaction.editReply({
                    content: `${process.env.BOT_CONF} Response added to ${id}`,
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
            
                break;
            }
        }
    }
}