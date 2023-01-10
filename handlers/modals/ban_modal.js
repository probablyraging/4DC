const { EmbedBuilder } = require('discord.js');
const { sendResponse } = require('../../utils/utils');
const { v4: uuidv4 } = require("uuid");
const path = require('path');

module.exports = async (interaction) => {
    const { guild, member } = interaction;

    await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

    const targetId = interaction.fields.getTextInputValue('input1');
    const target = await guild.members.fetch(targetId).catch(() => { });
    const reason = interaction.fields.getTextInputValue('input2');
    const logChan = guild.channels.cache.get(process.env.LOG_CHAN);

    // If no target
    if (!target) return sendResponse(interaction, `${process.env.BOT_DENY} This user no longer exists`);
    // If no reason
    if (reason == null) return sendResponse(interaction, `${process.env.BOT_DENY} You must provide custom reason when selecting the 'Custom' option`);
    // Send a notification to the target user
    await target.send({
        content: `You have been banned from **ForTheContent** for\n> ${reason} \n\nJoin discord.gg/tn3nMu6A2B for ban appeals`
    }).catch(() => { });
    // Ban the target user
    await target.ban({
        deleteMessageSeconds: 604800,
        reason: reason
    }).catch(err => console.error(`${path.basename(__filename)} There was a problem banning a user: `, err));

    // Log to channel
    let log = new EmbedBuilder()
        .setColor("#E04F5F")
        .setAuthor({ name: `${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
        .setDescription(`**Member:** ${target.user.tag} *(${target.user.id})*
**Reason:** ${reason}`)
        .setFooter({ text: `Ban • ${uuidv4()}`, iconURL: process.env.LOG_BAN })
        .setTimestamp();

    logChan.send({
        embeds: [log]
    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));

    sendResponse(interaction, `${target.user.tag} was banned from the server`);
}