const { Message, MessageEmbed } = require('discord.js');
const path = require('path');
/**
 * @param {Message} message 
 */
module.exports = async (message, client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const logChan = guild.channels.cache.get(process.env.LOG_CHAN);

    if (message.channel.id === '990849600237740082') {
        if (message?.embeds?.length >= 1) {
            message.embeds.forEach(embed => {
                if (embed.fields[0].value === 'Blacklist Words') {
                    function converTimestampToSimpleFormat(timestamp) {
                        const t = new Date(timestamp);
                        const date = ('0' + t.getDate()).slice(-2);
                        const month = ('0' + (t.getMonth() + 1)).slice(-2);
                        const year = t.getFullYear();
                        let hours = ('0' + t.getHours()).slice(-2);
                        const minutes = ('0' + t.getMinutes()).slice(-2);
                        const seconds = ('0' + t.getSeconds()).slice(-2);
                        let meridiem = 'AM';
                        if (hours > 12 && hours < 22) {
                            hours = (hours - 2).toString().slice(-1);
                            meridiem = 'PM';
                        } else if (hours >= 21) {
                            hours = '1' + (hours - 2).toString().slice(-1);
                            meridiem = 'PM';
                        }
                        if (hours === '12') meridiem = 'PM';
                        if (hours === '00') hours = '12';
                        const time = `${date}/${month}/${year}, ${hours}:${minutes}${meridiem}`;
                        return time;
                    }

                    const expiresAt = converTimestampToSimpleFormat(new Date().getTime() + 300000);

                    // Log to channel
                    let log = new MessageEmbed()
                        .setColor("#E04F5F")
                        .setAuthor({ name: `AutoMod`, iconURL: `https://discord.com/assets/e7af5fc8fa27c595d963c1b366dc91fa.gif` })
                        .setDescription(`**Member:** ${message?.author.tag} *(${message?.author.id})*
**Action:** Timeout
**Expires:** ${expiresAt}
**Reason:** Flagged word/phrase`)
                        .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
                        .setTimestamp();

                    logChan.send({
                        embeds: [log]
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));
                }
            });
        }
    }
}