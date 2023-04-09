const { Message, EmbedBuilder, codeBlock } = require('discord.js');
/**
 * @param {Message} message 
 */
module.exports = async (message) => {
    if (message?.channel.id === process.env.SUGGESTIONS_CHAN && !message.author.bot) {
        try {
            const suggestionEmbed = new EmbedBuilder()
                .setColor('Random')
                .setAuthor({ name: `${message?.author.tag}`, iconURL: message?.author.displayAvatarURL({ dynamic: true }) })
                .addFields({ name: `Suggestion`, value: codeBlock(message?.content) })

            message?.delete();
            const suggestionMessage = await message?.channel.send({ embeds: [suggestionEmbed] });
            await suggestionMessage.react('<:upvote:842350442297688074>');
            await suggestionMessage.react('<:downvote:842350442481713153>');
        } catch (err) {
            console.error('There was a problem with the suggestions module: ', err);
        }
    }
}