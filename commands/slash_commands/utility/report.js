require("dotenv").config();
const { MessageEmbed, EmbedFooterData } = require("discord.js");
const { v4: uuidv4 } = require("uuid");
const { addCooldown, hasCooldown, removeCooldown } = require("../../../modules/report_cooldown");
const path = require("path");
const fetch = require('node-fetch');

module.exports = {
    name: "report",
    description: "Report a user to the CreatorHub staff",
    permission: ``,
    cooldown: 60,
    type: `CHAT_INPUT`,
    usage: `/report [@username] [reason] (imageURL)`,
    options: [
        {
            name: "username",
            description: "The user to report",
            type: "USER",
            required: true
        },
        {
            name: "reason",
            description: "Why the user is being reported",
            type: "STRING",
            required: true
        },
        {
            name: "image",
            description: "Include an optional image URL in your report",
            type: "STRING",
            required: false
        }
    ],
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const guild = interaction.client.guilds.cache.get(process.env.GUILD_ID);
        const staffChannel = interaction.client.channels.cache.get(process.env.STAFF_CHAT);
        const reportId = uuidv4();
        const { user, options } = interaction;

        const target = options.getMember("username");
        const reason = options.getString("reason");
        const image = options.getString("image");

        if (reason && reason.length > 1024) {
            await interaction.editReply({
                content: `${process.env.BOT_DENY} \`Reason cannot exceeds 1024 characters\``
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
            return;
        }

        if (!hasCooldown(user.id)) {
            const reportEmbed = new MessageEmbed()
                .setColor("#E04F5F")
                .setAuthor({ name: `${user?.tag}`, iconURL: user?.displayAvatarURL({ dynamic: true }) })
                .addField(`Reported User`, `<@${target.id}>`, false)
                .addField(`Reason`, `\`\`\`${reason}\`\`\``, false)
                .setFooter({ text: `${guild.name} • Report ID ${reportId}`, iconURL: guild.iconURL({ dynamic: true }) })
                .setTimestamp();

            if (image) {
                const resolve = await fetch(image);
                const response = resolve.status;

                if (response !== 200) {
                    return interaction.editReply({
                        content: `${process.env.BOT_DENY} \`Invalid image URL. Please try again using IMGUR instead\` [imgur.com](<https://imgur.com>)`
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                } else {
                    reportEmbed.addField(`Attachment`, `${image}`, false);
                }

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

                    user.send({ embeds: [replyEmbed] }).catch(err => {
                        console.error("There was a problem sending a DM to the user: ", err);
                    });
                }
            });

            addCooldown(user.id);

            setTimeout(() => {
                removeCooldown(user.id);
            }, 60000);

            await interaction.editReply({ content: `${process.env.BOT_CONF} \`Your report has been submitted\`` }).catch(err => console.error("There was a problem replying to the interaction: ", err));
        } else {
            await interaction.editReply({ content: `${process.env.BOT_DENY} \`You must wait 60 seconds between reports\`` }).catch(err => console.error("There was a problem replying to the interaction: ", err));
        }
    }
};
