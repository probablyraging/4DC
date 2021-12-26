const { client, CommandInteraction, MessageEmbed } = require('discord.js');
const path = require('path');

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

            let cmdName = command.name;
            if (options._subcommand) cmdName = `${command.name} > ${options._subcommand}`;

            const log = new MessageEmbed()
                .setColor('#FF9E00')
                .setAuthor({ name: `${user?.tag} used a command`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                .addField(`Command`, `${cmdName}`, false)
                .addField(`Channel`, `${channel}`, true)
                .setFooter(`${guild.name}`, `${guild.iconURL({ dynamic: true })}`)
                .setTimestamp()

            cmdOptions = [];

            options._hoistedOptions.forEach(option => {
                if (option.name === 'command') cmdOptions.push(`Param: ${option?.value}`);
                if (option.name === 'reason') cmdOptions.push(`Param: ${option?.value}`);
                if (option.name === 'number') cmdOptions.push(`Param: ${option?.value}`);
                if (option.name === 'username') cmdOptions.push(`User: ${option?.user?.tag}`);
                if (option.name === 'channel') cmdOptions.push(`Channel: #${option?.channel?.name}`);
            })

            let input = cmdOptions.join('\n') || 'None';
            log.addField(`Input`, `\`\`\`${input}\`\`\``, false)

            logChan.send({
                embeds: [log]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }
    }
}