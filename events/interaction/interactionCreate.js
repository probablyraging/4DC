const { client, CommandInteraction, MessageEmbed } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {client} client 
     */
    execute(interaction, client) {
        const { channel, user, guild, options } = interaction

        if (interaction.isCommand() || interaction.isContextMenu()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return interaction.reply({
                content: `${process.env.BOT_INFO} Could not run this command`,
                ephemeral: true
            })
                && client.command.module(interaction.commandName);

            command.execute(interaction, client)

            // log command usage
            const logChan = client.channels.cache.get(process.env.CMD_CHAN)

            console.log(`\x1b[36m%s\x1b[0m`, `${interaction.member.displayName}`, `used /${command.name}`);

            cmdOptionsArr = [];

            const response = new MessageEmbed()
                .setColor('#FF9E00')
                .setAuthor(`${user.tag} used /${command.name}`, `${user.displayAvatarURL({ dynamic: true })}`)
                .addField(`Channel:`, `${channel}`, false)
                .setFooter(`${guild.name}`, `${guild.iconURL({ dynamic: true })}`)
                .setTimestamp()

            options._hoistedOptions?.forEach(option => {
                cmdOptionsArr.push(`${option.name}: ${option.value}`);
            });

            const capFirst = cmdOptionsArr.join('\n').split(/\n/g).map(x => x.charAt(0).toUpperCase() + x.substr(1)).join("\n");

            response.addField(`Values:`, `\`\`\`${capFirst}\`\`\``, false);

            logChan.send({
                embeds: [response]
            });
        }
    }
}