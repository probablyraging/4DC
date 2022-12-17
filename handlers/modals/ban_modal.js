const { EmbedBuilder } = require('discord.js');
const { v4: uuidv4 } = require("uuid");
const path = require('path');

module.exports = async (interaction) => {
    const { guild, member } = interaction;

    await interaction.deferReply({ ephemeral: true });

    const targetId = interaction.fields.getTextInputValue('input1');
    const target = await guild.members.fetch(targetId).catch(() => { });
    const reason = interaction.fields.getTextInputValue('input2');
    const logChan = guild.channels.cache.get(process.env.LOG_CHAN);

    if (!target) {
        return interaction.editReply({
            content: `${process.env.BOT_DENY} This user no longer exists`
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
    }

    await target.send({
        content: `You have been banned from **ForTheContent** for\n> ${reason} \n\nJoin discord.gg/tn3nMu6A2B for ban appeals`
    }).catch(() => { });

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
        .setFooter({ text: `Ban • ${uuidv4()}`, iconURL: 'https://i.imgur.com/WjgRUio.png' })
        .setTimestamp();

    logChan.send({
        embeds: [log]
    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));

    interaction.editReply({
        content: `${target.user.tag} was banned from the server`,
        ephemeral: true
    }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
}