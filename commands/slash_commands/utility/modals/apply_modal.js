const { MessageEmbed } = require('discord.js');
const path = require('path');

module.exports = async (interaction) => {
    const { member, guild } = interaction

    if (interaction.customId === 'staff-modal') {
        const age = interaction.fields.getTextInputValue('input1');
        const region = interaction.fields.getTextInputValue('input2');
        const comments = interaction.fields.getTextInputValue('input3');

        const channel = guild.channels.cache.get(process.env.STAFF_APP2);

        const response = new MessageEmbed()
            .setColor('#FF9E00')
            .setAuthor({ name: `${member?.user.tag}`, iconURL: member?.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`Staff application`)
            .addField(`⠀`, `\`\`\`Age: ${age}
Region: ${region}
Comments: ${comments}\`\`\``, true)

        channel.send({
            content: `<@&${process.env.STAFF_ROLE}>`,
            embeds: [response]
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

        interaction.reply({
            content: `${process.env.BOT_CONF} \`Thank you! Your staff application has been received. If your application is successful a staff member will contact you\``,
            ephemeral: true
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
    }
}