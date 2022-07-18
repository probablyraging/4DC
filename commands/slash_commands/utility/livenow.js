const { ContextMenuInteraction, ApplicationCommandType, EmbedBuilder, ActivityType } = require('discord.js');
const path = require('path');

module.exports = {
    name: `livenow`,
    description: `Shows a list of all server members who are currently streaming`,
    access: '',
    cooldown: 10,
    type: ApplicationCommandType.ChatInput,
    usage: `/livenow`,
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { guild } = interaction;

        await interaction.deferReply({ ephemeral: true });

        const liveArr = [];

        let response = new EmbedBuilder()
            .setColor('#fff500')
            .setTitle(`${process.env.LIVE_NOW} Live Now | SHOW SUPPORT`)

        await guild.members.fetch().then(async fetchedMembers => {
            fetchedMembers.forEach(member => {
                for (let i = 0; i < 5; i++) {
                    if (!member.user.bot && member.presence?.activities[i] && member.presence?.activities[i].type === ActivityType.Streaming) {
                        liveArr.push({ username: member.user.tag, url: member.presence?.activities[i].url, title: member.presence?.activities[i].details || 'Unknown', state: member.presence?.activities[i].state || 'Unknown' });
                    }
                }
            });
        });

        if (liveArr.length < 1) {
            response.setDescription(`There are currently **${liveArr.length}** members streaming`)
        } else {
            response.setDescription(`There are currently **${liveArr.length}** members streaming
Please be respectful when visiting other member's streams`)
            liveArr.forEach(entry => {
                response.addFields({ name: `⠀`, value: `**Member:** ${entry.username}
**Title:** ${entry.title}
**Streaming:** ${entry.state}
**Link:** [${entry.url}](${entry.url})`, inline: false})
            });
        }

        interaction.editReply({
            embeds: [response],
            ephemeral: true
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
    }
}