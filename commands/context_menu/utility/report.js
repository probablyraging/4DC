const { EmbedBuilder, ContextMenuInteraction, ApplicationCommandType, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const { addCooldown, hasCooldown, removeCooldown } = require('../../../modules/misc/report_cooldown');
const path = require('path');

module.exports = {
    name: `Report Message`,
    description: ``,
    cooldown: 5,
    type: ApplicationCommandType.Message,
    /**
     *
     * @param {ContextMenuInteraction} interaction
     */
    async execute(interaction) {
        const { client, user, guild, channel } = interaction;

        const fetchMsg = await channel.messages.fetch(interaction.targetId);
        const target = fetchMsg.author;
        const reportId = uuidv4();
        const staffChannel = client.channels.cache.get(process.env.STAFF_CHAN);

        if (!hasCooldown(user.id)) {
            let reportEmbed = new EmbedBuilder()
                .setColor('#E04F5F')
                .setAuthor({ name: `${user?.tag}`, iconURL: user?.displayAvatarURL({ dynamic: true }) })
                .setDescription(`[View Message](${fetchMsg?.url})`)
                .addFields({ name: `Message Author`, value: `${target}`, inline: false },
                    { name: `Reported Content`, value: `\`\`\`${fetchMsg?.content}\`\`\``, inline: false })
                .setFooter({ text: `ID ${user?.id}`, iconURL: guild.iconURL({ dynamic: true }) })
                .setTimestamp();

            const button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('report-close')
                        .setLabel('Close Report')
                        .setStyle(ButtonStyle.Danger)
                );

            await staffChannel.send({ content: `<@&${process.env.STAFF_ROLE}> <@&${process.env.MOD_ROLE}>`, embeds: [reportEmbed], components: [button] }).catch((err) => console.error(`Could not send report '${reportId}' to staff channel: `, err));

            addCooldown(user.id);

            setTimeout(() => {
                removeCooldown(user.id);
            }, 60000);

            await interaction.reply({
                content: `${process.env.BOT_CONF} Your report has been submitted`,
                ephemeral: true,
            }).catch((err) => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        } else {
            await interaction.reply({
                content: `${process.env.BOT_DENY} You must wait 60 seconds between reports`,
                ephemeral: true,
            }).catch((err) => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }
    },
};
