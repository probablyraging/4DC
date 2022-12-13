const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const path = require('path');

module.exports = {
    name: `msg`,
    description: `Send a direct message to a user`,
    defaultMemberPermissions: ['Administrator'],
    cooldown: 0,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `username`,
        description: `The user to send the message to`,
        type: ApplicationCommandOptionType.User,
        required: true,
    },
    {
        name: `message`,
        description: `The message you want to send`,
        type: ApplicationCommandOptionType.String,
        required: false,
    },
    {
        name: `image`,
        description: `If you want to send an image as well`,
        type: ApplicationCommandOptionType.String,
        required: false,
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { options } = interaction;

        const target = options.getMember('username');
        const message = options.getString('message') || ` `;
        const image = options.getString('image');

        await interaction.deferReply({ ephemeral: true });

        if (image) {
            target.send({
                content: `${message}`,
                files: [image]
            }).catch(() => {
                return interaction.editReply({
                    content: `${process.env.BOT_DENY} I could not send a DM to this user`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
            });
        } else {
            target.send({
                content: `${message}`
            }).catch(() => {
                return interaction.editReply({
                    content: `${process.env.BOT_DENY} I could not send a DM to this user`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
            });
        }

        interaction.editReply({
            content: `${process.env.BOT_CONF} Message sent`,
            ephemeral: true
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
    }
}