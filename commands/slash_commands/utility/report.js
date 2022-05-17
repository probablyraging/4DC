require("dotenv").config();
const { MessageEmbed, ContextMenuInteraction, MessageActionRow, TextInputComponent, Modal } = require("discord.js");
const { v4: uuidv4 } = require("uuid");
const { addCooldown, hasCooldown, removeCooldown } = require("../../../modules/misc/report_cooldown");
const path = require("path");

module.exports = {
    name: "report",
    description: "Report a user to the CreatorHub staff",
    access: '',
    cooldown: 60,
    type: `CHAT_INPUT`,
    usage: `/report [@username] [reason] (imageURL)`,
    options: [
        {
            name: "proof",
            description: "Provide proof of your report",
            type: 11,
            required: true
        }
    ],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { client, options, user, guild } = interaction;

        const attachment = options.getAttachment('proof')

        const modal = new Modal()
            .setTitle('Report Form')
            .setCustomId('report-modal')

        const input1 = new TextInputComponent()
            .setCustomId('input1')
            .setLabel('Username')
            .setStyle(1)
            .setPlaceholder('Username and tag (e.g: ProbablyRaging#0001')
            .setMinLength(1)
            .setMaxLength(54)
            .setRequired(true)

        const input2 = new TextInputComponent()
            .setCustomId('input2')
            .setLabel('Reason')
            .setStyle(2)
            .setPlaceholder('Please include a reason for your report..')
            .setMinLength(1)
            .setMaxLength(1024)
            .setRequired(true)

        const row1 = new MessageActionRow().addComponents([input1]);
        const row2 = new MessageActionRow().addComponents([input2]);

        modal.addComponents(row1, row2);

        await interaction.showModal(modal);

        client.on('interactionCreate', async (interaction) => {
            if (interaction.customId === 'report-modal') {
                let target = interaction.fields.getTextInputValue('input1');
                const reason = interaction.fields.getTextInputValue('input2');

                // try to match the modal's username input to an actual member
                guild.members.cache.forEach(member => {
                    const split = target.toLowerCase().split('#');

                    if (member.user.username.toLowerCase() === split[0] && member.user.discriminator === split[1]) {
                        target = `<@${member.id}>`;
                    }
                });

                const reportId = uuidv4();
                const staffChannel = interaction.client.channels.cache.get(process.env.STAFF_CHAN);

                if (!hasCooldown(user.id)) {
                    let reportEmbed = new MessageEmbed()
                        .setColor("#E04F5F")
                        .setAuthor({ name: `${user?.tag}`, iconURL: user?.displayAvatarURL({ dynamic: true }) })
                        .addField(`Reported User`, `${target}`, false)
                        .addField(`Reason`, `\`\`\`${reason}\`\`\``, false)
                        .setFooter({ text: `${guild.name} • Report ID ${reportId}`, iconURL: guild.iconURL({ dynamic: true }) })
                        .setTimestamp();

                    if (attachment) {
                        reportEmbed.setImage(attachment.url)
                    }

                    const reactionMessage = await staffChannel.send({ embeds: [reportEmbed] }).catch(err => console.error(`Could not send report '${reportId}' to staff channel: `, err));

                    await reactionMessage.react("⛔").catch(err => console.error(`Could not react to message '${reportId}': `, err));

                    const filter = (reaction, user) => {
                        return guild.members.cache.find((member) => member.id === user.id).permissions.has("MANAGE_MESSAGES");
                    };

                    const collector = reactionMessage.createReactionCollector({ filter, dispose: true });

                    collector.on("collect", (reaction, closingUser) => {
                        if (!closingUser.bot && reaction.emoji.name === "⛔") {
                            const closedEmbed = new MessageEmbed(reportEmbed)
                                .addField(`Closed By`, `${closingUser}`, false)
                                .setColor("#32BEA6");
                            reactionMessage.edit({ embeds: [closedEmbed] });
                            reactionMessage.reactions.resolve("⛔").remove("⛔");

                            const replyEmbed = new MessageEmbed()
                                .setColor("#32BEA6")
                                .setTitle(`CreatorHub Report`)
                                .setAuthor({ name: `${user?.tag}`, iconURL: user?.displayAvatarURL({ dynamic: true }) })
                                .setDescription(`Your report's status has been updated to \`CLOSED\``)
                                .addField(`Report Message`, `\`\`\`${reason}\`\`\``, false)
                                .addField(`Closed By`, `${closingUser}`, false)
                                .setFooter({ text: `${guild.name} • Report ID ${reportId}`, iconURL: guild.iconURL({ dynamic: true }) })
                                .setTimestamp();

                            if (attachment) {
                                replyEmbed.setImage(attachment.url)
                            }

                            user.send({ embeds: [replyEmbed] }).catch(err => {
                                console.error("There was a problem sending a DM to the user: ", err);
                            });
                        }
                    });

                    addCooldown(user.id);

                    setTimeout(() => {
                        removeCooldown(user.id);
                    }, 60000);

                    await interaction.reply({ content: `${process.env.BOT_CONF} \`Your report has been submitted\`` }).catch(err => console.error("There was a problem replying to the interaction: ", err));
                } else {
                    await interaction.reply({ content: `${process.env.BOT_DENY} \`You must wait 60 seconds between reports\`` }).catch(err => console.error("There was a problem replying to the interaction: ", err));
                }
            }
        });
    }
};
