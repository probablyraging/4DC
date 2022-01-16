const { Message, MessageEmbed } = require('discord.js');
const { ImgurClient } = require('imgur');
const path = require('path');
/**
 * @param {Message} message 
 */
module.exports = async (message, client, Discord) => {
    const resChan = client.channels.cache.get(process.env.RES_CHAN);

    if (message?.channel.id === process.env.RES_CHAN && !message?.author.bot) {
        const content = message?.cleanContent.split('\n');

        let response = new MessageEmbed()
            .setColor('#F44336')
            .setTitle(`${content[0]}`)
            .setDescription(`${content.slice(1).join('\n')}`)
            .setFooter({ text: message?.author?.tag, iconURL: message?.author?.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()

        let msgAttachment = message?.attachments.size > 0 ? message?.attachments.first().url : null;

        if (msgAttachment) {
            // create a new imgur client
            const imgur = new ImgurClient({ clientId: process.env.IMGUR_ID, clientSecret: process.env.IMGUR_SECRET });

            // upload attachment to imgur, get the link and attach it to the embed
            const response = await imgur.upload({
                image: msgAttachment,
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem uploading an image to imgur: `, err));

            response.forEach(res => {
                response.setImage(res.data.link)
            });
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