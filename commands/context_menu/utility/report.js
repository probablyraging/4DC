const { EmbedBuilder, ContextMenuInteraction, ApplicationCommandType } = require('discord.js');
const { v4: uuidv4 } = require("uuid");
const { addCooldown, hasCooldown, removeCooldown } = require("../../../modules/misc/report_cooldown");
const path = require('path');

module.exports = {
    name: `Report Message`,
    description: ``,
    permission: ``,
    cooldown: 5,
    type: ApplicationCommandType.Message,
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { user, guild, channel } = interaction;

        const fetchMsg = await channel.messages.fetch(interaction.targetId);
        const target = fetchMsg.author;
        const reportId = uuidv4();
        const staffChannel = interaction.client.channels.cache.get(process.env.STAFF_CHAN);

        if (!hasCooldown(user.id)) {
            let reportEmbed = new EmbedBuilder()
                .setColor("#E04F5F")
                .setAuthor({ name: `${user?.tag}`, iconURL: user?.displayAvatarURL({ dynamic: true }) })
                .setDescription(`[View Message](${fetchMsg?.url})`)
                .addFields({ name: `Message Author`, value: `${target}`, inline: false },
                    { name: `Reported Content`, value: `\`\`\`${fetchMsg?.content}\`\`\``, inline: false })
                .setFooter({ text: `${guild.name} • Report ID ${reportId}`, iconURL: guild.iconURL({ dynamic: true }) })
                .setTimestamp();

            const reactionMessage = await staffChannel.send({ content: `<@&${process.env.STAFF_ROLE}>`, embeds: [reportEmbed] }).catch(err => console.error(`Could not send report '${reportId}' to staff channel: `, err));

            await reactionMessage.react("⛔").catch(err => console.error(`Could not react to message '${reportId}': `, err));

            const filter = (reaction, user) => {
                return guild.members.cache.find((member) => member.id === user.id).permissions.has("ManageMessages");
            };

            const collector = reactionMessage.createReactionCollector({ filter, dispose: true });

            collector.on("collect", (reaction, closingUser) => {
                if (!closingUser.bot && reaction.emoji.name === "⛔") {
                    const closedEmbed = new EmbedBuilder(reportEmbed)
                        .setColor("#32BEA6")
                        .setAuthor({ name: `${user?.tag}`, iconURL: user?.displayAvatarURL({ dynamic: true }) })
                        .setDescription(`[View Message](${fetchMsg?.url})`)
                        .addFields({ name: `Closed By`, value: `${closingUser}`, inline: false },
                            { name: `Message Author`, value: `${target}`, inline: false },
                            { name: `Reported Content`, value: `\`\`\`${fetchMsg?.content}\`\`\``, inline: false })
                        .setFooter({ text: `${guild.name} • Report ID ${reportId}`, iconURL: guild.iconURL({ dynamic: true }) })
                        .setTimestamp();
                    reactionMessage.edit({ embeds: [closedEmbed] });
                    reactionMessage.reactions.resolve("⛔").remove("⛔");

                    const replyEmbed = new EmbedBuilder()
                        .setColor("#32BEA6")
                        .setTitle(`CreatorHub Report`)
                        .setAuthor({ name: `${user?.tag}`, iconURL: user?.displayAvatarURL({ dynamic: true }) })
                        .setDescription(`Your report's status has been updated to \`CLOSED\``)
                        .addFields({ name: `Closed By`, value: `${closingUser}`, inline: false })
                        .setFooter({ text: `${guild.name} • Report ID ${reportId}`, iconURL: guild.iconURL({ dynamic: true }) })
                        .setTimestamp();

                    user.send({ embeds: [replyEmbed] }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                }
            });

            addCooldown(user.id);

            setTimeout(() => {
                removeCooldown(user.id);
            }, 60000);

            await interaction.reply({
                content: `${process.env.BOT_CONF} Your report has been submitted`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        } else {
            await interaction.reply({
                content: `${process.env.BOT_DENY} You must wait 60 seconds between reports`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }
    }
}