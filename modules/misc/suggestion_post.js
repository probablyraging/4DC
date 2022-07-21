const { Message, EmbedBuilder } = require('discord.js');
const path = require('path');
/**
 * @param {Message} message 
 */
module.exports = async (message) => {
    if (message?.channel.id === process.env.SUGGESTIONS_CHAN && !message.author.bot) {
        const suggestionEmbed = new EmbedBuilder()
            .setColor('Random')
            .setAuthor({ name: `${message?.author.tag}`, iconURL: message?.author.displayAvatarURL({ dynamic: true }) })
            .addFields({ name: `Suggestion`, value: `\`\`\`${message?.content}\`\`\`` })

        message?.delete().catch(err => console.error('There was a problem deleting a message: ', err));
        const suggestionMessage = await message?.channel.send({ embeds: [suggestionEmbed] }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
        await suggestionMessage.react('<:upvote:842350442297688074>').catch(err => console.error(`${path.basename(__filename)} There was a problem reacting to a message: `, err));
        await suggestionMessage.react('<:downvote:842350442481713153>').catch(err => console.error(`${path.basename(__filename)} There was a problem reacting to a message: `, err));
    }
}