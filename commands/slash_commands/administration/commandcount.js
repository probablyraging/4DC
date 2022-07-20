const { ContextMenuInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const commandCountSchema = require('../../../schemas/misc/command_count');
const path = require('path');

module.exports = {
    name: `commandcount`,
    description: `A log of how many times each command has been used`,
    access: 'owner',
    cooldown: 0,
    type: ApplicationCommandType.ChatInput,
    usage: `/msg (@username) (message) (imageURL)`,
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { guild } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const response = new EmbedBuilder()
            .setColor('#32BEA6')
            .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
            .setTimestamp()

        const sort = await commandCountSchema.find({})

        sortArr = [];
        for (const data of sort) {
            const { command, uses } = data;

            sortArr.push({ command, uses });
        }

        sortArr.sort(function (a, b) {
            return b.uses - a.uses;
        });

        function kFormatter(num) {
            return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000 * 1).toFixed(0)) + 'K' : Math.sign(num) * Math.abs(num);
        }

        response.addFields({
            name: `${process.env.BOT_INFO} \`Command Usage\``, value: `⠀
\`/${sortArr[0].command}\` - **${sortArr[0].uses}** uses
\`/${sortArr[1].command}\` - **${sortArr[1].uses}** uses
\`/${sortArr[2].command}\` - **${sortArr[2].uses}** uses
\`/${sortArr[3].command}\` - **${sortArr[3].uses}** uses
\`/${sortArr[4].command}\` - **${sortArr[4].uses}** uses
\`/${sortArr[5].command}\` - **${sortArr[5].uses}** uses
\`/${sortArr[6].command}\` - **${sortArr[6].uses}** uses
\`/${sortArr[7].command}\` - **${sortArr[7].uses}** uses
\`/${sortArr[8].command}\` - **${sortArr[8].uses}** uses
\`/${sortArr[9].command}\` - **${sortArr[9].uses}** uses
\`/${sortArr[10].command}\` - **${sortArr[10].uses}** uses
\`/${sortArr[11].command}\` - **${sortArr[11].uses}** uses
\`/${sortArr[12].command}\` - **${sortArr[12].uses}** uses
\`/${sortArr[13].command}\` - **${sortArr[13].uses}** uses
\`/${sortArr[14].command}\` - **${sortArr[14].uses}** uses
\`/${sortArr[15].command}\` - **${sortArr[15].uses}** uses
\`/${sortArr[16].command}\` - **${sortArr[16].uses}** uses
\`/${sortArr[17].command}\` - **${sortArr[17].uses}** uses
\`/${sortArr[18].command}\` - **${sortArr[18].uses}** uses
\`/${sortArr[19].command}\` - **${sortArr[19].uses}** uses`, inline: false
        })

        interaction.editReply({
            embeds: [response],
            ephemeral: true
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));





    }
}