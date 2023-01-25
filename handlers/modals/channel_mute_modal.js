const { EmbedBuilder } = require('discord.js');
const { dbUpdateOne, sendResponse } = require('../../utils/utils');
const muteSchema = require('../../schemas/misc/mute_schema');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

module.exports = async (interaction) => {
    const { member, guild, channel } = interaction

    await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

    const logChan = guild.channels.cache.get(process.env.LOG_CHAN);
    const target = interaction.fields.getTextInputValue('input1');
    let duration = interaction.fields.getTextInputValue('input2') || '0';
    const reason = interaction.fields.getTextInputValue('input3');

    // Try to match the modal's username input to an actual member
    let fetchedMember;
    guild.members.cache.forEach(member => {
        const split = target.toLowerCase().split('#');
        if (member.user.username.toLowerCase() === split[0] && member.user.discriminator === split[1]) {
            fetchedMember = member;
        }
    });
    // If no member could be found
    if (!fetchedMember) return sendResponse(interaction, `${process.env.BOT_DENY} The user your are trying to mute doesn't exist`);
    // Update the user's channel permissions
    channel.permissionOverwrites.edit(fetchedMember?.user.id, {
        SendMessages: false,
    }).catch(err => { return console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err) });
    // If a duration was provided, get a timestamp for when the mute should expire and update the database
    const myDate = new Date();
    const timestamp = !duration || duration === '0' ? 'null' : myDate.getTime() + (duration * 60 * 60 * 1000);
    await dbUpdateOne(muteSchema, { userId: fetchedMember?.user.id, channelId: channel.id }, { userId: fetchedMember?.user.id, channelId: channel.id, timestamp: timestamp });

    duration = !duration || duration === '0' ? 'Permanent' : `${duration} ${duration > 1 ? 'hours' : 'hour'}`;

    // Log to channel
    let log = new EmbedBuilder()
        .setColor("#E04F5F")
        .setAuthor({ name: `${member?.user.tag}`, iconURL: member?.user.displayAvatarURL({ dynamic: true }) })
        .setDescription(`**Member:** ${fetchedMember?.user.tag} *(${fetchedMember?.user.id})*
**Channel:** ${channel}
**Duration:** ${duration}
**Reason:** ${reason}`)
        .setFooter({ text: `Channel Mute • ${uuidv4()}`, iconURL: process.env.LOG_MUTE })
        .setTimestamp();

    logChan.send({
        embeds: [log]
    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));

    sendResponse(interaction, `${process.env.BOT_CONF} ${fetchedMember} was muted in ${channel}`);
}