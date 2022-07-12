const { ContextMenuInteraction, MessageEmbed } = require('discord.js');
const path = require('path');

module.exports = {
    name: `livenow`,
    description: `Shows a list of all server members who are currently streaming`,
    access: '',
    cooldown: 10,
    type: `CHAT_INPUT`,
    usage: `/livenow`,
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { guild } = interaction;

        await interaction.deferReply({ ephemeral: true });

        const liveArr = [];

        let response = new MessageEmbed()
            .setColor('#fff500')
            .setTitle(`${process.env.LIVE_NOW} Live Now | SHOW SUPPORT`)

        await guild.members.fetch().then(async fetchedMembers => {
            fetchedMembers.forEach(member => {
                for (let i = 0; i < 5; i++) {
                    if (!member.user.bot && member.presence?.activities[i] && member.presence?.activities[i].type === 'STREAMING') {
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
                response.addField(`⠀`, `**Member:** ${entry.username}
**Title:** ${entry.title}
**Streaming:** ${entry.state}
**Link:** [${entry.url}](${entry.url})`, false)
            });
        }

        // const liveRole = guild.roles.cache.get(process.env.LIVE_ROLE);
        // const liveSize = guild.members.cache.filter(member => member.roles.cache.find(role => role === liveRole)).size;
        // const liveMember = guild.members.cache.filter(member => member.roles.cache.find(role => role === liveRole)).map(member => member.user.id);

        // let response = new MessageEmbed()
        //     .setColor('#fff500')
        //     .setTitle(`${process.env.LIVE_NOW} Live Now | SHOW SUPPORT`)

        // if (liveSize < 1) {
        //     response.setDescription(`There are currently **${liveSize}** members streaming`)
        // } else {
        //     response.setDescription(`There are currently **${liveSize}** members streaming`)
        //     response.addField(`⠀`, `<@${liveMember.join('>\n<@')}>`, false)
        // }

        interaction.editReply({
            embeds: [response],
            ephemeral: true
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
    }
}