const { ContextMenuInteraction } = require('discord.js');
const path = require('path');

module.exports = {
    name: `say`,
    description: `Send a message as the bot`,
    permission: `MANAGE_MESSAGES`,
    locked: true,
    cooldown: 0,
    type: `CHAT_INPUT`,
    usage: `/say (#channel) (message) (imageURL)`,
    options: [{
        name: `message`,
        description: `The message you want to send`,
        type: `STRING`,
        required: false,
    },
    {
        name: `channel`,
        description: `The channel to send the message to. Leave black for current channel`,
        type: `CHANNEL`,
        required: false,
    },
    {
        name: `image`,
        description: `If you want to send an image as well`,
        type: `STRING`,
        required: false,
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    execute(interaction) {
        const { member, channel, options } = interaction;

        const toChannel = options.getChannel('channel');
        const message = options.getString('message') || ` `;
        const image = options.getString('image');

        if (!toChannel) {
            if (image) {
                channel.send({
                    content: `${message}`,
                    files: [image]
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
            } else {
                channel.send({
                    content: `${message}`
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
            }
        } else {
            if (image) {
                toChannel.send({
                    content: `${message}`,
                    files: [image]
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
            } else {
                toChannel.send({
                    content: `${message}`
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
            }
        }

        interaction.reply({
            content: `${process.env.BOT_CONF} \`Message sent\``,
            ephemeral: true
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
    }
}