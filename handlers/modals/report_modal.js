const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { addCooldown, hasCooldown, removeCooldown } = require("../../modules/misc/report_cooldown");
const { getAttachment } = require("../../modules/misc/report_attachment");
const { v4: uuidv4 } = require("uuid");
const path = require('path');

module.exports = async (interaction) => {
    const { client, user, guild } = interaction;

    let target = interaction.fields.getTextInputValue('input1');
    const reason = interaction.fields.getTextInputValue('input2');

    // Try to match the modal's username input to an actual member
    guild.members.cache.forEach(member => {
        const split = target.toLowerCase().split('#');

        if (member.user.username.toLowerCase() === split[0] && member.user.discriminator === split[1]) {
            target = `<@${member.id}>`;
        } else if (member.user.username.toLowerCase() === split[0]) {
            target = `<@${member.id}> - partial match`
        }
    });

    const reportId = uuidv4();
    const staffChannel = client.channels.cache.get(process.env.STAFF_CHAN);

    if (!hasCooldown(user.id)) {
        let reportEmbed = new EmbedBuilder()
            .setColor("#E04F5F")
            .setAuthor({ name: `${user?.tag}`, iconURL: user?.displayAvatarURL({ dynamic: true }) })
            .addFields({ name: `Reported User`, value: `${target}`, inline: false },
                { name: `Reason`, value: `\`\`\`${reason}\`\`\``, inline: false })
            .setFooter({ text: `ID ${user?.id}`, iconURL: guild.iconURL({ dynamic: true }) })
            .setTimestamp();

        const attachment = getAttachment(1);

        if (attachment) {
            reportEmbed.setImage(attachment)
        }

        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('report-close')
                    .setLabel('Close Report')
                    .setStyle(ButtonStyle.Danger)
            );

        await staffChannel.send({ content: `<@&${process.env.STAFF_ROLE}> <@&${process.env.MOD_ROLE}>`, embeds: [reportEmbed], components: [button] }).catch(err => console.error(`Could not send report '${reportId}' to staff channel: `, err));

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