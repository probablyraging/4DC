const { ContextMenuInteraction, MessageEmbed } = require('discord.js');
const { promisify } = require('util');
const { glob } = require('glob');
const { join } = require('path');
const PG = promisify(glob);

module.exports = {
    name: `help`,
    description: `Information about CreatorBot and it's features and commands`,
    permission: ``,
    type: `CHAT_INPUT`,
    usage: `/help [commandName]`,
    options: [{
        name: `command`,
        description: `The name of the feature or command`,
        type: `STRING`,
        required: true,
        choices: [{ name: `channelmute`, value: `channelmute` }, { name: `delete`, value: `delete` }, { name: `embed`, value: `embed` }, { name: `info`, value: `info` }, { name: `move`, value: `move` }, { name: `rules`, value: `rules` }, { name: `warn`, value: `warn` }, { name: `apply`, value: `apply` }, { name: `avatar`, value: `avatar` }, { name: `help`, value: `help` }, { name: `report`, value: `report` }, { name: `serverinfo`, value: `serverinfo` }, { name: `whois`, value: `whois` }, { name: `menu`, value: `menu` }],
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { guild, client, options } = interaction;

        const choice = options.getString('command');

        cmdArr = [];

        (await PG(`${process.cwd()}/commands/slash_commands/*/*.js`)).map(async (file) => {
            const command = require(file);
            cmdArr.push(command);
        });

        if (choice !== 'menu') {

            let perm = 'Utility';
            let color = '#3fa6ff';

            const cmd = cmdArr.find(c => c.name === choice);

            if (cmd.permission === 'MANAGE_MESSAGES') perm = 'Moderation', color = '#05fffc';

            const response = new MessageEmbed()
                .setColor(color)
                .setTitle(`${perm} > ${cmd.name.toUpperCase()}`)
                .setDescription(`${cmd.description}`)

            if (!cmd.usage) {
                cmd.options.forEach(option => {
                    response.addField(`Usage (sub-command)`, `\`\`\`${option.usage}\`\`\``, false);
                });
            } else {
                response.addField(`Usage`, `\`\`\`${cmd.usage}\`\`\``, false);
            }

            interaction.reply({
                embeds: [response],
                ephemeral: true
            });
        } else {
            modCmds = [];
            utilCmds = [];

            cmdArr.forEach(cmd => {
                if (!cmd.permission) utilCmds.push(cmd.name);
                if (cmd.permission === 'MANAGE_MESSAGES') modCmds.push(cmd.name);
            });

            const response = new MessageEmbed()
                .setColor('#32BEA6')
                .setTitle(`ℹ️ CreatorBot's Help Menu`)
                .setDescription(`**[CreatorHub Server Rules](https://discord.com/channels/${process.env.GUILD_ID}/${process.env.RULE_CHAN}) - [Discord ToS](https://discord.com/terms) - [Discord Community Guidelines](https://discord.com/guidelines)**

Use \`/help [command]\` for information about a specific command
Parameters inside \`[]\` brackets are mandatory
Parameters inside \`()\` brackets are optional
⠀`)
                .addField(`👮 Staff Commands`, `\`/${modCmds.join(`\`, \`/`)}\`
⠀`, false)
                .addField(`👥 Everyone`, `\`/${utilCmds.join(`\`, \`/`)}\`
⠀`, false)
                .setFooter(`${guild.name}`, `${client.user.displayAvatarURL()}`)
                .setTimestamp()

            interaction.reply({
                embeds: [response],
                ephemeral: true
            });
        }
    }
}