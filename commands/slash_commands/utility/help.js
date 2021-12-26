const { ContextMenuInteraction, MessageEmbed } = require('discord.js');
const { promisify } = require('util');
const { glob } = require('glob');
const PG = promisify(glob);
const path = require('path');

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
        choices: [{ name: `about`, value: `about` }, { name: `channelmute`, value: `channelmute` }, { name: `delete`, value: `delete` }, { name: `embed`, value: `embed` }, { name: `help`, value: `help` }, { name: `info`, value: `info` }, { name: `move`, value: `move` }, { name: `resetckq`, value: `resetckq` }, { name: `rule`, value: `rule` }, { name: `warn`, value: `warn` }, { name: `apply`, value: `apply` }, { name: `avatar`, value: `avatar` }, { name: `report`, value: `report` }, { name: `serverinfo`, value: `serverinfo` }, { name: `whois`, value: `whois` }, { name: `menu`, value: `menu` }, { name: `invite`, value: `invite` }, { name: `livenow`, value: `livenow` }, { name: `say`, value: `say` }, { name: `index`, value: `index` }, { name: `modschoice`, value: `modschoice` }, { name: `lockdown`, value: `lockdown` }, { name: `leaderboard`, value: `leaderboard` }],
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
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
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
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }
    }
}