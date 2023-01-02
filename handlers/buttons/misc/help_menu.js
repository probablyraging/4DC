const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const path = require('path');

module.exports = async (interaction) => {
    const { customId } = interaction;

    await interaction.deferUpdate();

    // Initial embed and buttons
    let embed = new EmbedBuilder()
        .setColor('#5865f2')

    const btn = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('help-home')
                .setLabel('Home')
                .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                .setCustomId('help-games')
                .setLabel('Games')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('help-tokens')
                .setLabel('Tokens')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('help-delete')
                .setLabel('Delete')
                .setStyle(ButtonStyle.Danger)
        );

    // Game buttons
    const gamesbtn = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('help-home')
                .setLabel('Home')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('help-counting')
                .setLabel('Counting Game')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('help-letter')
                .setLabel('Last Letter Game')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('help-delete')
                .setLabel('Delete')
                .setStyle(ButtonStyle.Danger)
        );

    // Main navigation
    // Home
    if (customId.split('-')[1] === 'home') {
        interaction.fetchReply('@original').then(reply => {
            if (reply.embeds[0].title.toLowerCase().includes('home')) return;
            embed.setTitle('Home');
            embed.setDescription(`Use the buttons below to access help menus for 4DC and ForTheContent's features`);
            reply.edit({ embeds: [embed], components: [btn] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        });
    }
    // Games
    if (customId.split('-')[1] === 'games') {
        interaction.fetchReply('@original').then(reply => {
            if (reply.embeds[0].title.toLowerCase().includes('games')) return;
            embed.setTitle('Games');
            embed.setDescription(`ForTheContent has two game channels, the <#851584454036029441> channel and the <#896069772624683018> channel

Use the buttons below to access information on how to play these games`);
            reply.edit({ embeds: [embed], components: [gamesbtn] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        });
    }
    // Tokens
    if (customId.split('-')[1] === 'tokens') {
        interaction.fetchReply('@original').then(reply => {
            if (reply.embeds[0].title.toLowerCase().includes('tokens')) return;
            embed.setTitle('Tokens');
            embed.setDescription(`Tokens are the virtual currency of ForTheContent. They can be used in the <#1049791650060324954> to purchase things like;
• Link embeds
• Automatic link sharing
• Double rank XP

You can earn tokens in a few ways, including;
• Sending messages in non-promotional or game channels (chatting)
• Bumping the server using the </bump:947088344167366698> command in the <#855427926136193054> channel
• Being awarding tokens for a useful or helpful post that you made on the server

You can check your tokens balance by using the </rank:1040546996735451176> command in <#837945839799500850>

Click the "information" button below any item in the <#1049791650060324954> for more information about that item
`);
            reply.edit({ embeds: [embed], components: [btn] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        });
    }
    // Delete
    if (customId.split('-')[1] === 'delete') {
        interaction.fetchReply('@original').then(reply => reply.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting an interaction: `, err)));
    }

    // Game navigation
    // Counting game
    if (customId.split('-')[1] === 'counting') {
        interaction.fetchReply('@original').then(reply => {
            if (reply.embeds[0].title.toLowerCase().includes('counting')) return;
            embed.setTitle('Counting Game');
            embed.setDescription(`Players take turns counting in sequence from the current number. For example, if the current number is 5, the player would type "6", and the next player would type "7", and so on.

If a player submits an incorrect number, the game will "fail" and reset back to the starting number. Players can only submit one number at a time. Each player is allowed up to 2 personal saves, which they can use to prevent the game from failing when they make a mistake. In addition, the server as a whole can have up to 3 guild saves, which are donated by individual players by using the </counting donatesave:1031245457902555208> command and these saves can be used by any player to prevent the game from failing when any player makes a mistake.

Players can earn game saves by bumping the server by using the </bump:947088344167366698> command in the <#855427926136193054> channel when it is ready to be bumped, or by spending tokens to buy them in the <#1049791650060324954>.

To participate in the game, simply type the correct next number in the counting sequence`);
            reply.edit({ embeds: [embed], components: [gamesbtn] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        });
    }
    // Last letter game
    if (customId.split('-')[1] === 'letter') {
        interaction.fetchReply('@original').then(reply => {
            if (reply.embeds[0].title.toLowerCase().includes('letter')) return;
            embed.setTitle('Last Letter Game');
            embed.setDescription(`Players take turns submitting new words that start with the last letter of the previous word. For example, if the previous word is "dog", the next player might submit the word "giraffe". Then, the next player would need to submit a word that starts with "e", such as "elephant". Players can only submit one word at a time. If a player submits a word that does not start with the correct letter, the game will "fail".

Each word's value is determined by the Scrabble scoring system, where each letter has a specific point value based on its rarity. A word that contains many rare letters will have a higher score than a word with only common letters. For example, the word "cat" would earn you 3 points, while the word "cyanogen" would earn you 15 points

To participate in the game, simply think of a word that starts with the last letter of the previous word and type it in the chat. Try to come up with creative and unusual words to keep the game interesting for everyone.`);
            reply.edit({ embeds: [embed], components: [gamesbtn] }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        });
    }
}