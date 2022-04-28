const { ContextMenuInteraction, MessageEmbed } = require('discord.js');
const path = require('path');

module.exports = {
    name: `apply`,
    description: `Apply for a staff role`,
    cooldown: 86400,
    type: `CHAT_INPUT`,
    usage: `/apply [age] [country] [reason]`,
    options: [{
        name: `age`,
        description: `Your age`,
        type: `NUMBER`,
        required: true,
    },
    {
        name: `country`,
        description: `Your country or region`,
        type: `STRING`,
        required: true,
    },
    {
        name: `reason`,
        description: `Your reason for applying`,
        type: `STRING`,
        required: true,
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    execute(interaction) {
        const { guild, member, options } = interaction;

        const channel = guild.channels.cache.get(process.env.STAFF_APP2);

        const age = options.getNumber('age');
        const country = options.getString('country');
        const reason = options.getString('reason');

        if (!member?.roles?.cache.has(process.env.RANK10_ROLE) && !member?.roles?.cache.has(process.env.RANK15_ROLE) && !member?.roles?.cache.has(process.env.RANK20_ROLE) && !member?.roles?.cache.has(process.env.RANK25_ROLE) && !member?.roles?.cache.has(process.env.RANK30_ROLE)) {
            interaction.reply({
                content: `${process.env.BOT_DENY} \`You must be rank 10 to apply for a staff role\``,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        } else {
            if (age && age.length > 1024) {
                return interaction.reply({
                    content: `${process.env.BOT_DENY} \`Age field exceeds 1024 characters\``,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
            }

            if (country && country.length > 1024) {
                return interaction.reply({
                    content: `${process.env.BOT_DENY} \`Country field exceeds 1024 characters\``,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
            }

            if (reason && reason.length > 1024) {
                return interaction.reply({
                    content: `${process.env.BOT_DENY} \`Reason field exceeds 1024 characters\``,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
            }

            const response = new MessageEmbed()
                .setColor('#FF9E00')
                .setAuthor({ name: `${member?.user.tag}`, iconURL: member?.user.displayAvatarURL({ dynamic: true }) })
                .setDescription(`Staff application`)
                .addField(`⠀`, `\`\`\`Age: ${age}
Region: ${country}
Reason: ${reason}\`\`\``, true)

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
}