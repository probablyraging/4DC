const { Message, MessageEmbed } = require('discord.js');
const path = require('path');
/**
 * 
 * @param {Message} message 
 */
module.exports = (message, client, Discord) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const blChan = client.channels.cache.get(process.env.BL_CHAN);
    const muteChan = client.channels.cache.get(process.env.MUTES_CHAN);

    const member = message?.member;

    if (!member?.roles?.cache.has(process.env.STAFF_ROLE) && !message?.author?.bot && message?.mentions.members.size > 4) {
        member?.send({
            content: `${process.env.BOT_DENY} \`Mass mentions (${message?.mentions?.members?.size}) detected. You have been muted for 30 seconds to prevent spamming\``
        }).catch(() => {
            message?.reply({
                content: `${process.env.BOT_DENY} \`Mass mentions (${message?.mentions?.members?.size}) detected. You have been muted for 30 seconds to prevent spamming\``,
                deleteallowedMentions: { repliedUser: true },
                failIfNotExists: false
            }).then(msg => {
                setTimeout(() => { msg?.delete().catch(err => console.error(`${path.basename(__filename)}\nThere was a problem deleting a message: `, err)) }, 5000);
            });
        });

        setTimeout(() => { message?.delete().catch(err => console.error(`${path.basename(__filename)}\nThere was a problem deleting a message: `, err)) }, 600);

        member?.roles.add(process.env.MUTED_ROLE).catch(err => console.error(`${path.basename(__filename)}\nThere was a problem adding a role: `, err));

        setTimeout(() => {
            if (guild?.members?.cache.get(member?.id)) {
                member?.roles?.remove(process.env.MUTED_ROLE).catch(err => console.error(`${path.basename(__filename)}\nThere was a problem removing a role: `, err));
            }
        }, 30000);

        const msgContent = message?.content || ` `;

        const blacklistEmbed = new Discord.MessageEmbed()
            .setAuthor(`${message?.author?.tag}'s message was deleted`, `${message?.author?.displayAvatarURL({ dynamic: true })}`)
            .setColor("#E04F5F")
            .addField("Author", `<@${message?.author?.id}>`, true)
            .addField("Channel", `${message?.channel}`, true)
            .addField("Reason", `Mass mentions`, true)
            .addField('Message', `\`\`\`${msgContent}\`\`\``)
            .setFooter(`${guild?.name}`, `${guild?.iconURL({ dynamic: true })}`)
            .setTimestamp()

        const muteEmbed = new MessageEmbed()
            .setColor('#E04F5F') // RED
            .setAuthor(`${message?.author?.tag} has been auto muted`, `${message?.author?.displayAvatarURL({ dynamic: true })}`)
            .addField(`Channel:`, `Server wide mute`, true)
            .addField(`By:`, `<@841409086960697385>`, false)
            .addField(`Reason:`, `\`\`\`Mass mentions\`\`\``, false)
            .setFooter(`${guild.name}`, `${guild.iconURL({ dynamic: true })}`)
            .setTimestamp()

        blChan.send({
            embeds: [blacklistEmbed]
        }).catch(err => console.error(`${path.basename(__filename)}\nThere was a problem sending a log: `, err));

        muteChan.send({
            embeds: [muteEmbed]
        }).catch(err => console.error(`${path.basename(__filename)}\nThere was a problem sending a log: `, err));
    }
}

