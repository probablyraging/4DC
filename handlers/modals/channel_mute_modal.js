const { MessageEmbed } = require('discord.js');
const mongo = require('../../mongo');
const muteTimeoutSchema = require('../../schemas/database_logs/mute_timeout_schema');
const path = require('path');

module.exports = async (interaction) => {
    const { member, guild, channel } = interaction

    const logChan = guild.channels.cache.get(process.env.LOG_CHAN);
    const target = interaction.fields.getTextInputValue('input1');
    const reason = interaction.fields.getTextInputValue('input2');

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
        SEND_MESSAGES: false,
    }).catch(err => { return console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err) });

    // Log to channel
    let log = new MessageEmbed()
        .setColor("#ffdf78")
        .setAuthor({ name: `${member?.user.tag}`, iconURL: member?.user.displayAvatarURL({ dynamic: true }) })
        .setDescription(`**Member:** ${fetchedMember?.user.tag} *(${fetchedMember?.user.id})*
**Action:** Channel Mute
**Channel:** ${channel}
**Reason:** ${reason}`)
        .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
        .setTimestamp();

    logChan.send({
        embeds: [log]
    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));

    // Log to database for dashboard
    const logTimestamp = new Date().getTime();

    await mongo().then(async mongoose => {
        await muteTimeoutSchema.create({
            userId: fetchedMember?.user.id,
            username: fetchedMember?.user.tag,
            author: member?.id,
            authorTag: `${member?.user.tag}`,
            reason: reason,
            timestamp: logTimestamp,
            type: 'Channel Mute'
        });
    });

    let dmFail = false;

    fetchedMember.send({
        content: `${fetchedMember} - you were muted in #${channel.name} on ${guild.name}
                                                                                    
**Reason**
> ${reason}`
    }).catch(() => dmFail = true).then(() => {
        let replyMsg = dmFail ? `${process.env.BOT_CONF} \`${fetchedMember?.user.tag} was muted in #${channel.name}\`\n${process.env.BOT_DENY} \`I could not send ${fetchedMember?.user.tag} a notification\`` : `${process.env.BOT_CONF} \`${fetchedMember?.user.tag} was muted in #${channel.name}\``;

        interaction.reply({
            content: `${replyMsg}`,
            ephemeral: true
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
    });
}