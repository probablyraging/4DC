const { EmbedBuilder, CommandInteraction, ApplicationCommandType, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { sendResponse } = require('../../../utils/utils');
const { v4: uuidv4 } = require('uuid');
const { addCooldown, hasCooldown, removeCooldown } = require('../../../modules/misc/report_cooldown');
const path = require('path');

module.exports = {
    name: `Report Message`,
    cooldown: 5,
    type: ApplicationCommandType.Message,
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const { client, user, guild, channel } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const fetchMsg = await channel.messages.fetch(interaction.targetId);
        const target = fetchMsg.author;
        const reportId = uuidv4();
        const staffChannel = client.channels.cache.get(process.env.STAFF_CHAN);

        // If the this user is on cooldown
        if (hasCooldown(user.id)) return sendResponse(interaction, `${process.env.BOT_DENY} You must wait 60 seconds between reports`);

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

        await staffChannel.send({ content: `<@&${process.env.STAFF_ROLE}>`, embeds: [reportEmbed], components: [button] }).catch((err) => console.error(`Could not send report '${reportId}' to staff channel: `, err));

        // Add the user to a 60 second cooldown to prevent spamming
        addCooldown(user.id);
        setTimeout(() => {
            removeCooldown(user.id);
        }, 60000);

        sendResponse(interaction, `${process.env.BOT_CONF} Your report has been submitted`);
    },
};
