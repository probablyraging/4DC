const { ContextMenuInteraction } = require('discord.js');

module.exports = {
    name: `move`,
    description: `Move a message to a specified channel. Move up to 5 messages at a time`,
    permission: `MANAGE_MESSAGES`,
    type: `CHAT_INPUT`,
    options: [{
        name: `channel`,
        description: `The channel you want to move a message to`,
        type: `CHANNEL`,
        required: true
    },
    {
        name: `message`,
        description: `The ID of the message you want to move`,
        type: `STRING`,
        required: true
    },
    {
        name: `message2`,
        description: `The ID of the message you want to move`,
        type: `STRING`,
        required: false
    },
    {
        name: `message3`,
        description: `The ID of the message you want to move`,
        type: `STRING`,
        required: false
    },
    {
        name: `message4`,
        description: `The ID of the message you want to move`,
        type: `STRING`,
        required: false
    },
    {
        name: `message5`,
        description: `The ID of the message you want to move`,
        type: `STRING`,
        required: false
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { channel, options } = interaction;

        const messageId = options.getString('message');
        const messageId2 = options.getString('message2');
        const messageId3 = options.getString('message3');
        const messageId4 = options.getString('message4');
        const messageId5 = options.getString('message5');
        const toChannel = options.getChannel('channel');

        messagesArr = [];
        messagesArr.push(messageId, messageId2, messageId3, messageId4, messageId5)

        const fetchMsg = channel.messages.fetch();


        for (let i = 0; i < messagesArr.length; i++) {
            (await fetchMsg).filter(msg => {
                if (msg.id === messagesArr[i]) {
                    let msgAttachment = msg.attachments.size > 0 ? msg.attachments : null;
                    let msgContent = msg.content || ' ';

                    msgAuthor = msg.author;

                    if (msgAttachment) {
                        imageArr = [];

                        msgAttachment.forEach(image => {
                            imageArr.push(image.url);
                        })

                        toChannel.createWebhook(msg.member.displayName, { avatar: msg.author.displayAvatarURL() }).then(webhook => {
                            webhook.send({
                                content: `${msgContent}`,
                                files: imageArr
                            }).then(() => {
                                webhook.delete();
                            });
                        });

                        msg.delete();
                    } else {
                        toChannel.createWebhook(msg.member.displayName, { avatar: msg.author.displayAvatarURL() }).then(webhook => {
                            webhook.send({
                                content: `${msgContent}`
                            }).then(() => {
                                webhook.delete();
                            });
                        });

                        msg.delete();
                    }
                }
            });
        }

        try {
            await interaction.reply({
                content: `${msgAuthor} your post was moved to ${toChannel}`
            });
        } catch {
            await interaction.reply({
                content: `${process.env.BOT_DENY} \`The message or message author no longer exists\``,
                ephemeral: true
            });
        }
    }
}