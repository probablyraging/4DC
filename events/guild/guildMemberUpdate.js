const { MessageEmbed } = require('discord.js');
const timeouts = new Set();

module.exports = {
    name: 'guildMemberUpdate',
    execute(newMember, oldMember, client, Discord) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);

        const userUpChan = client.channels.cache.get(process.env.USERUP_CHAN);
        const botChan = client.channels.cache.get(process.env.BOT_CHAN);
        const mutesChan = client.channels.cache.get(process.env.MUTES_CHAN);

        // nickname changes
        if (newMember?.nickname === null) {
            nName = newMember?.displayName
        } else {
            nName = newMember?.nickname
        }

        if (oldMember?.nickname === null) {
            oName = oldMember?.displayName
        } else {
            oName = oldMember?.nickname
        }

        if (newMember?.displayName !== oldMember?.displayName) {
            const log = new Discord.MessageEmbed()
                .setAuthor(`${newMember?.user?.tag}`, `${newMember?.user?.displayAvatarURL({ dynamic: true })}`)
                .setColor('#FF9E00') // ORANGE
                .setDescription(`**<@${newMember?.id}> changed their nickname**
                
⠀`)
                .addField(`New Nickname`, `${nName}#${newMember?.user?.discriminator}`, true)
                .addField(`Old Nickname`, `${oName}#${oldMember?.user?.discriminator}`, true)
                .setThumbnail(`${newMember?.user?.displayAvatarURL({ dynamic: true })}`)
                .setFooter(`${oldMember.guild.name}`)
                .setTimestamp()

            userUpChan.send({
                embeds: [log]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a log: `, err));

            botChan.send({
                content: `${oName}#${oldMember?.user?.discriminator} is now known as ${nName}#${newMember?.user?.discriminator}`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
        }

        // timeout logs
        if (!timeouts.has(oldMember?.user.id)) {
            if (oldMember?.communicationDisabledUntilTimestamp !== null) {
                const timestamp = oldMember?.communicationDisabledUntilTimestamp;
                const date = new Date(timestamp).toLocaleString();

                const log = new MessageEmbed()
                    .setColor('#E04F5F')
                    .setAuthor(`Timeout added to ${oldMember?.user?.tag}`, `${oldMember?.user?.displayAvatarURL({ dynamic: true })}`)
                    .addField(`Expires`, `\`\`\`${date}\`\`\``, false)
                    .setFooter(`${guild.name}`, `${guild.iconURL({ dynamic: true })}`)
                    .setTimestamp()

                mutesChan.send({
                    embeds: [log]
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a log: `, err));

                timeouts.add(oldMember?.user.id).catch(err => console.error(`${path.basename(__filename)} There was a problem adding to the map: `, err));;
            }
        } else if (timeouts.has(oldMember?.user.id) && oldMember?.communicationDisabledUntilTimestamp === null) {
            const log = new MessageEmbed()
                .setColor('#32BEA6')
                .setAuthor(`Timeout removed from ${oldMember?.user?.tag}`, `${oldMember?.user?.displayAvatarURL({ dynamic: true })}`)
                .setFooter(`${guild.name}`, `${guild.iconURL({ dynamic: true })}`)
                .setTimestamp()

            mutesChan.send({
                embeds: [log]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a log: `, err));

            timeouts.delete(oldMember?.id).catch(err => console.error(`${path.basename(__filename)} There was a problem deleting from the map: `, err));
        }
    }
}



