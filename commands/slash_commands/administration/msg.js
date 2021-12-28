const { ContextMenuInteraction } = require('discord.js');
const path = require('path');

module.exports = {
    name: `msg`,
    description: `Send a direct message as the bot`,
    permission: `MANAGE_MESSAGES`,
    locked: true,
    cooldown: 0,
    type: `CHAT_INPUT`,
    usage: `/msg (@username) (message) (imageURL)`,
    options: [{
        name: `username`,
        description: `The user to send the message to`,
        type: `USER`,
        required: true,
    },
    {
        name: `message`,
        description: `The message you want to send`,
        type: `STRING`,
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
        const { options } = interaction;

        const target = options.getMember('username');
        const message = options.getString('message') || ` `;
        const image = options.getString('image');

        if (image) {
            target.send({
                content: `${message}`,
                files: [image]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
        } else {
            target.send({
                content: `${message}`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
        }

        interaction.reply({
            content: `${process.env.BOT_CONF} \`Message sent\``,
            ephemeral: true
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
    }
}