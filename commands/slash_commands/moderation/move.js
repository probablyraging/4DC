const { ContextMenuInteraction } = require('discord.js');

module.exports = {
    name: `move`,
    description: `Move a message to a specific channel. Move up to 5 messages at a time`,
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
        const { guild, channel, options } = interaction;

        const messageId = options.getString('message');
        const messageId2 = options.getString('message2');
        const messageId3 = options.getString('message3');
        const messageId4 = options.getString('message4');
        const messageId5 = options.getString('message5');
        const toChannel = options.getChannel('channel');

        function filterArr(value, index, self) {
            return self.indexOf(value) === index;
        }

        messagesArr = [];
        messagesArr.push(messageId, messageId2, messageId3, messageId4, messageId5);
        const delNull = messagesArr.filter(function (e) { return e != null; });
        const filteredArr = delNull.filter(filterArr);

        if (!guild.me.permissionsIn(channel).has('MANAGE_MESSAGES') || !guild.me.permissionsIn(channel).has('SEND_MESSAGES') || !guild.me.permissionsIn(channel).has('VIEW_CHANNEL')) {
            return interaction.reply({
                content: `${process.env.BOT_DENY} \`I do not have to proper permissions for #${channel.name}\``,
                ephemeral: true
            });
        }

        const fetchMsg = channel.messages.fetch();

        const channelType = toChannel.type;

        if (channelType === 'GUILD_VOICE') cType = 'voice channel';
        if (channelType === 'GUILD_CATEGORY') cType = 'category';
        if (channelType === 'GUILD_NEWS') cType = 'news channel';

        if (channelType !== 'GUILD_TEXT') {
            return interaction.reply({
                content: `${process.env.BOT_DENY} \`You can't move a message to a ${cType}\``,
                ephemeral: true
            });
        }

        for (let i = 0; i < filteredArr.length; i++) {
            (await fetchMsg).filter(msg => {
                if (msg.id === filteredArr[i]) {
                    let msgAttachment = msg.attachments.size > 0 ? msg.attachments : null;
                    let msgContent = msg.content || ' ';

                    author = msg.author;

                    if (!author) {
                        msg.delete();

                        return interaction.reply({
                            content: `${process.env.BOT_DENY} \`That user no longer exists. Their message(s) were deleted\``,
                            ephemeral: true
                        });
                    }

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
            interaction.reply({
                content: `${author} your post was moved to ${toChannel}`
            });
        } catch {
            interaction.reply({
                content: `${process.env.BOT_DENY} \`The message or message author no longer exists\``,
                ephemeral: true
            });
        }
    }
}