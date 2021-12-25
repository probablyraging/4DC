const { Message, MessageEmbed } = require('discord.js');
const path = require('path');
/**
 * 
 * @param {Message} message 
 */
module.exports = (message, client, Discord) => {
    const resChan = client.channels.cache.get(process.env.RES_CHAN);

    if (message?.channel.id === process.env.RES_CHAN && !message?.author.bot) {

        const content = message?.cleanContent.split('\n');

        let response = new MessageEmbed()
            .setColor('#F44336')
            .setTitle(`${content[0]}`)
            .setDescription(`${content.slice(1).join('\n')}`)
            .setFooter(`By ${message?.author?.tag}`, `${message?.author?.displayAvatarURL({ dynamic: true })}`)
            .setTimestamp()

        let msgAttachment = message?.attachments?.size > 0 ? message?.attachments : null;

        if (msgAttachment) {
            response.setImage(msgAttachment.first().url).catch(err => console.error(`${path.basename(__filename)} There was a problem adding an image: `, err));
        }

        resChan.send({
            embeds: [response]
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err)).then(msg => {
            msg.react('<a:upvote:842350442297688074>')
            msg.react('<a:downvote:842350442481713153>')
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem adding reactions: `, err));

        message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
    }
}