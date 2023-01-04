const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { addCooldown, hasCooldown, removeCooldown } = require("../../modules/misc/report_cooldown");
const { getAttachment } = require("../../modules/misc/report_attachment");
const { sendReply } = require('../../utils/utils');
const { v4: uuidv4 } = require("uuid");

module.exports = async (interaction) => {
    const { client, user, guild } = interaction;

    const staffChannel = client.channels.cache.get(process.env.STAFF_CHAN);
    let target = interaction.fields.getTextInputValue('input1');
    const reason = interaction.fields.getTextInputValue('input2');
    const reportId = uuidv4();

    // Try to match the modal's username input to an actual member
    guild.members.cache.forEach(member => {
        const split = target.toLowerCase().split('#');
        if (member.user.username.toLowerCase() === split[0] && member.user.discriminator === split[1]) {
            target = `<@${member.id}>`;
        } else if (member.user.username.toLowerCase() === split[0]) {
            target = `<@${member.id}> - partial match`
        }
    });
    // Don't allow users to spam the report function
    if (hasCooldown(user.id)) return sendReply(interaction, `${process.env.BOT_DENY} You must wait 60 seconds between reports`);

    let reportEmbed = new EmbedBuilder()
        .setColor("#E04F5F")
        .setAuthor({ name: `${user?.tag}`, iconURL: user?.displayAvatarURL({ dynamic: true }) })
        .addFields({ name: `Reported User`, value: `${target}`, inline: false },
            { name: `Reason`, value: `\`\`\`${reason}\`\`\``, inline: false })
        .setFooter({ text: `ID ${user?.id}`, iconURL: guild.iconURL({ dynamic: true }) })
        .setTimestamp();
    // Get the attachment if one exists and add it to the embed
    const attachment = getAttachment(1);
    if (attachment) reportEmbed.setImage(attachment);
    // Create a button for closing the report
    const button = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('report-close')
                .setLabel('Close Report')
                .setStyle(ButtonStyle.Danger)
        );

    await staffChannel.send({ content: `<@&${process.env.STAFF_ROLE}>`, embeds: [reportEmbed], components: [button] }).catch(err => console.error(`Could not send report '${reportId}' to staff channel: `, err));
    // Add the user to the cooldown set and remove them after a given time
    addCooldown(user.id);
    setTimeout(() => {
        removeCooldown(user.id);
    }, 60000);

    sendReply(interaction, `${process.env.BOT_CONF} Your report has been submitted`);
}