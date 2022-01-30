require("dotenv").config();
const { MessageEmbed } = require("discord.js");
const path = require("path");

module.exports = {
    name: `move`,
    description: `Move a message to a specific channel. Move up to 5 messages at a time`,
    permission: `MODERATE_MEMBERS`,
    cooldown: 10,
    type: `CHAT_INPUT`,
    usage: `/move [#toChannel] [messageId] (messageId2)...`,
    options: [
        {
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
        }
    ],
    /**
     *
     * @param {ContextMenuInteraction} interaction
     */
    async execute(interaction) {
        const { client, user, guild, channel, options } = interaction;

        const messageId = options.getString("message");
        const messageId2 = options.getString("message2");
        const messageId3 = options.getString("message3");
        const messageId4 = options.getString("message4");
        const messageId5 = options.getString("message5");
        const toChannel = options.getChannel("channel");

        // Add another message on a newline to an existing string
        function concatMessage(value, newline) {
            return value ? value + "\n" + newline : newline;
        }

        const msgUpChan = client.channels.cache.get(process.env.MSGUP_CHAN);

        function filterArr(value, index, self) {
            return self.indexOf(value) === index;
        }

        let messagesArr = [];
        messagesArr.push(messageId, messageId2, messageId3, messageId4, messageId5);
        const delNull = messagesArr.filter(function (e) {
            return e != null;
        });
        const filteredArr = delNull.filter(filterArr);

        if (!guild.me.permissionsIn(channel).has("MANAGE_MESSAGES") || !guild.me.permissionsIn(channel).has("SEND_MESSAGES") || !guild.me.permissionsIn(channel).has("VIEW_CHANNEL")) {
            return interaction.reply({
                content: `${process.env.BOT_DENY} \`I do not have the proper permissions for #${channel.name}\``,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }

        const fetchMsg = channel.messages.fetch();
        const channelType = toChannel.type;

        let cType;
        if (channelType === "GUILD_VOICE") {
            cType = "voice channel";
        } else if (channelType === "GUILD_CATEGORY") {
            cType = "category";
        } else if (channelType === "GUILD_NEWS") {
            cType = "news channel";
        } else {
            cType = "text channel";
        }

        if (channelType !== "GUILD_TEXT") {
            return interaction.reply({
                content: `${process.env.BOT_DENY} \`You can't move a message to a ${cType}\``,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }

        let interactionReplyMessage;
        // We use a map to track the counts of messages from a specific author
        let movedMessageMap = new Map();
        let deletedMessages = 0;

        for (let i = 0; i < filteredArr.length; i++) {
            (await fetchMsg).filter(msg => {
                if (msg.id === filteredArr[i]) {
                    let msgAttachment = msg.attachments.size > 0 ? msg.attachments : null;
                    let msgContent = msg.content || " ";
                    let author = msg.author;

                    const avatarURL = author.displayAvatarURL({ format: 'png', size: 256 });

                    if (!author) {
                        msg.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                        deletedMessages++;
                    } else {
                        // If the user is a member, then they'll have a displayName - else, get their discord username
                        let authorUsername = msg.member ? msg.member.displayName : author.username;
                        if (msgAttachment) {
                            // If the message has an attachment, we need to move that too
                            let imageArr = [];

                            msgAttachment.forEach(image => {
                                imageArr.push(image.url);
                            });

                            toChannel.createWebhook(authorUsername, { avatar: avatarURL }).then(webhook => {
                                webhook.send({
                                    content: `${msgContent}`,
                                    files: imageArr,
                                    allowedMentions: {
                                        parse: ['users']
                                    }
                                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err)).then(() => {
                                    webhook.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook: `, err));
                                });
                            });

                            msg.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                        } else {
                            toChannel.createWebhook(authorUsername, { avatar: avatarURL }).then(webhook => {
                                webhook.send({
                                    content: `${msgContent}`,
                                    allowedMentions: {
                                        parse: ['users']
                                    }
                                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err)).then(() => {
                                    webhook.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook: `, err));
                                });
                            });

                            msg.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                        }

                        // Increase the count of messages from the author
                        if (movedMessageMap.has(author)) {
                            let count = movedMessageMap.get(author) + 1;
                            movedMessageMap.set(author, count);
                        } else {
                            movedMessageMap.set(author, 1);
                        }

                        // Add a message to the message-updates channel to state that the message was moved
                        let content;
                        if (msgContent.length > 1000) {
                            content = msgContent.slice(0, 1000) + "..." || ` `;
                        } else {
                            content = msgContent;
                        }

                        let log = new MessageEmbed()
                            .setAuthor({ name: `${user?.tag}`, iconURL: user?.displayAvatarURL({ dynamic: true }) })
                            .setColor("#FF9E00")
                            .setDescription(`**A message was moved**`)
                            .addField(`By`, `<@${user.id}>`, false)
                            .addField("Author", `<@${author.id}>`, true)
                            .addField("From", `${channel}`, true)
                            .addField("To", `${toChannel}`, true)
                            .addField("Message", `\`\`\`${content}\`\`\``)
                            .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
                            .setTimestamp();

                        msgUpChan.send({
                            embeds: [log]
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a log: `, err));
                    }
                }
            });
        }

        // Add in any deleted messages to the reply
        if (deletedMessages !== 0) {
            interactionReplyMessage = concatMessage(interactionReplyMessage, `${process.env.BOT_DENY} \`Deleted ${deletedMessages} message(s) from users who no longer exist.\``);
        }

        // Go through the authors and add how many messages were moved from each author to the reply
        movedMessageMap.forEach((value, key) => {
            if (value === 1) {
                interactionReplyMessage = concatMessage(interactionReplyMessage, `${value} of ${key}'s messages was moved to ${toChannel}`);
            } else {
                interactionReplyMessage = concatMessage(interactionReplyMessage, `${value} of ${key}'s messages were moved to ${toChannel}`);
            }
        });

        try {
            await interaction.reply(interactionReplyMessage)
                .catch(err => console.error(`${path.basename(__filename)} 1 There was a problem sending an interaction: `, err));
        } catch {
            await interaction.reply(`${process.env.BOT_DENY} \`There was a problem replying to this interaction.\``)
                .catch(err => console.error(`${path.basename(__filename)} 2 There was a problem sending an interaction: `, err));
        }
    }
};
