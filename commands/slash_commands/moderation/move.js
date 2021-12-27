const { ContextMenuInteraction, MessageEmbed } = require('discord.js');
const path = require('path');

module.exports = {
    name: `move`,
    description: `Move a message to a specific channel. Move up to 5 messages at a time`,
    permission: `MANAGE_MESSAGES`,
    type: `CHAT_INPUT`,
    usage: `/move [#toChannel] [messageId] (messageId2)...`,
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
        const { client, user, guild, channel, options } = interaction;

        const messageId = options.getString('message');
        const messageId2 = options.getString('message2');
        const messageId3 = options.getString('message3');
        const messageId4 = options.getString('message4');
        const messageId5 = options.getString('message5');
        const toChannel = options.getChannel('channel');

        const msgUpChan = client.channels.cache.get(process.env.MSGUP_CHAN);

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
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
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
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }

        for (let i = 0; i < filteredArr.length; i++) {
            (await fetchMsg).filter(msg => {
                if (msg.id === filteredArr[i]) {
                    let msgAttachment = msg.attachments.size > 0 ? msg.attachments : null;
                    msgContent = msg.content || ' ';

                    author = msg.author;

                    if (!author) {
                        msg.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));

                        return interaction.reply({
                            content: `${process.env.BOT_DENY} \`That user no longer exists. Their message(s) were deleted\``,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
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
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err)).then(() => {
                                webhook.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook: `, err));
                            });
                        });

                        msg.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                    } else {
                        toChannel.createWebhook(msg.member.displayName, { avatar: msg.author.displayAvatarURL() }).then(webhook => {
                            webhook.send({
                                content: `${msgContent}`
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err)).then(() => {
                                webhook.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook: `, err));
                            });
                        });

                        msg.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                    }
                }
            });
        }

        const embedContent = msgContent.slice(0, 1000) + '...' || ` `;

        try {
            let log = new MessageEmbed()
                .setAuthor({ name: `${user?.tag}`, iconURL: user?.displayAvatarURL({ dynamic: true }) })
                .setColor("#FF9E00")
                .setDescription(`**A message was moved**`)
                .addField(`By`, `<@${user.id}>`, false)
                .addField("Author", `<@${author.id}>`, true)
                .addField("From", `${channel}`, true)
                .addField("To", `${toChannel}`, true)
                .addField('Message', `\`\`\`${embedContent}\`\`\``)
                .setFooter(guild.name, `${guild.iconURL({ dynamic: true })}`)
                .setTimestamp()

            msgUpChan.send({
                embeds: [log]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a log: `, err));

            interaction.reply({
                content: `${author} your message was moved to ${toChannel}`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        } catch {
            interaction.reply({
                content: `${process.env.BOT_DENY} \`The message or message author no longer exists\``,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }
    }
}