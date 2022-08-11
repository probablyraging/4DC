const { Message, EmbedBuilder } = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
/**
 * @param {Message} message 
 */
module.exports = async (message, client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const logChan = guild.channels.cache.get(process.env.LOG_CHAN);

    if (message.channel.id === process.env.AUTOMOD_CHAN) {
        if (message?.embeds?.length >= 1) {
            message.embeds.forEach(embed => {
                if (embed.fields[0].value === 'Blacklist Words') {
                    const expiresAt = new Date(new Date().getTime() + 300000).toUTCString();

                    // Log to channel
                    let log = new EmbedBuilder()
                        .setColor("#E04F5F")
                        .setAuthor({ name: `AutoMod`, iconURL: `https://discord.com/assets/e7af5fc8fa27c595d963c1b366dc91fa.gif` })
                        .setDescription(`**Member:** ${message?.author.tag} *(${message?.author.id})*
**Expires:** ${expiresAt}
**Duration:** 5 minutes
**Reason:** Message contained a keyword defined in an AutoMod rule`)
                        .setFooter({ text: `Timeout • ${uuidv4()}`, iconURL: 'https://www.forthecontent.xyz/images/creatorhub/timeout_icon.png' })
                        .setTimestamp();

                    logChan.send({
                        embeds: [log]
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));
                }
            });
        }
    }
}