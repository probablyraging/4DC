const { MessageEmbed, ContextMenuInteraction, MessageActionRow, TextInputComponent, Modal } = require('discord.js');
const path = require('path');

module.exports = {
    name: `apply`,
    description: `Apply for a staff role`,
    access: '',
    cooldown: 86400,
    type: `CHAT_INPUT`,
    usage: `/apply [age] [country] [reason]`,
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { client, guild, member } = interaction;

        const modal = new Modal()
            .setTitle('Application for CreatorHub Staff')
            .setCustomId('staff-modal')

        const input1 = new TextInputComponent()
            .setCustomId('input1')
            .setLabel('Age')
            .setStyle(1)
            .setPlaceholder('18')
            .setMinLength(1)
            .setMaxLength(2)
            .setRequired(true)

        const input2 = new TextInputComponent()
            .setCustomId('input2')
            .setLabel('Region')
            .setStyle(1)
            .setPlaceholder('Canada')
            .setMinLength(1)
            .setMaxLength(54)
            .setRequired(true)

        const input3 = new TextInputComponent()
            .setCustomId('input3')
            .setLabel('Comments')
            .setStyle(2)
            .setPlaceholder('Tell us about yourself, why you would like to be staff, if you have any previous experience, etc..')
            .setMinLength(1)
            .setMaxLength(1024)
            .setRequired(true)

        const row1 = new MessageActionRow().addComponents([input1]);
        const row2 = new MessageActionRow().addComponents([input2]);
        const row3 = new MessageActionRow().addComponents([input3]);

        modal.addComponents(row1, row2, row3);

        await interaction.showModal(modal);

        client.on('interactionCreate', async (interaction) => {
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
        });
    }
}