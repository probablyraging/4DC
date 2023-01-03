const { EmbedBuilder } = require('discord.js');
const { dbUpdateOne } = require('../../modules/misc/database_update_handler');
const muteSchema = require('../../schemas/misc/mute_schema');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

module.exports = async (interaction) => {
    const { member, guild, channel } = interaction

    const logChan = guild.channels.cache.get(process.env.LOG_CHAN);
    const target = interaction.fields.getTextInputValue('input1');
    let duration = interaction.fields.getTextInputValue('input2');
    const reason = interaction.fields.getTextInputValue('input3');

    // Try to match the modal's username input to an actual member
    let fetchedMember;
    guild.members.cache.forEach(member => {
        const split = target.toLowerCase().split('#');

        if (member.user.username.toLowerCase() === split[0] && member.user.discriminator === split[1]) {
            fetchedMember = member;
        }
    });

    if (!fetchedMember) {
        return interaction.reply({
            content: `The user your are trying to mute doesn't exist`,
            ephemeral: true
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
    }

    channel.permissionOverwrites.edit(fetchedMember?.user.id, {
        SendMessages: false,
    }).catch(err => { return console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err) });

    if (duration > 0) {
        const myDate = new Date();
        const timestamp = myDate.setHours(myDate.getHours() + parseInt(duration));

        await dbUpdateOne(muteSchema, { userId: fetchedMember?.user.id }, { userId: fetchedMember?.user.id, timestamp, channelId: channel.id });
    }

    if (!duration || duration === '0') {
        duration = 'Permanent';
    } else {
        if (duration > 1) {
            duration = `${duration} hours`;
        } else {
            duration = `${duration} hour`;
        }
    }

    // Log to channel
    let log = new EmbedBuilder()
        .setColor("#E04F5F")
        .setAuthor({ name: `${member?.user.tag}`, iconURL: member?.user.displayAvatarURL({ dynamic: true }) })
        .setDescription(`**Member:** ${fetchedMember?.user.tag} *(${fetchedMember?.user.id})*
**Channel:** ${channel}
**Duration:** ${duration}
**Reason:** ${reason}`)
        .setFooter({ text: `Channel Mute • ${uuidv4()}`, iconURL: process.env.LOG_NUTE })
        .setTimestamp();

    logChan.send({
        embeds: [log]
    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));

    interaction.reply({
        content: `${process.env.BOT_CONF} ${fetchedMember} was muted in ${channel}`,
        ephemeral: true
    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
}