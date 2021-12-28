const path = require('path');

module.exports = {
    name: 'userUpdate',
    execute(oldUser, newUser, client, Discord) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);

        const userUpChan = client.channels.cache.get(process.env.USERUP_CHAN);
        const botChan = client.channels.cache.get(process.env.BOT_CHAN);

        // log avatar changes
        if (oldUser?.avatar !== newUser?.avatar) {
            const oldAvatar = `${oldUser?.displayAvatarURL({ dynamic: true })}?size=64` || 'https://cdn.discordapp.com/embed/avatars/0.png';

            const log = new Discord.MessageEmbed()
                .setAuthor({ name: `${newUser?.tag}`, iconURL: newUser?.displayAvatarURL({ dynamic: true }) })
                .setColor('#FF9E00')
                .setDescription(`**${newUser} changed their avatar
        


Old Avatar**`)
                .setImage(`${oldAvatar}`)
                .setThumbnail(`${newUser?.displayAvatarURL({ dynamic: true })}`)
                .setFooter(`${guild.name}`, `${guild.iconURL({ dynamic: true })}`)
                .setTimestamp()

            userUpChan.send({
                embeds: [log]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a log: `, err));
        }

        // log username changes (not nicknames, that is in guildMemberUpdates.js)
        if (oldUser?.username !== newUser?.username) {

            const log = new Discord.MessageEmbed()
                .setAuthor({ name: `${newUser?.tag}`, iconURL: newUser?.displayAvatarURL({ dynamic: true }) })
                .setColor('#FF9E00')
                .setDescription(`**${newUser} changed their username**
                    
⠀`)
                .addField(`New Username`, `${newUser?.tag}`, true)
                .addField(`Old Username`, `${oldUser?.tag}`, true)
                .setThumbnail(`${newUser?.displayAvatarURL({ dynamic: true })}`)
                .setFooter(`${guild.name}`, `${guild.iconURL({ dynamic: true })}`)
                .setTimestamp()

            userUpChan.send({
                embeds: [log]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a log: `, err));

            botChan.send({
                content: `${oldUser?.tag} is now known as ${newUser?.tag}`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a log: `, err));
        }
    }
}