const { ContextMenuInteraction, MessageEmbed } = require('discord.js');
const { promisify } = require('util');
const { glob } = require('glob');
const PG = promisify(glob);
const path = require('path');

module.exports = {
    name: `help`,
    description: `Information about CreatorBot and it's commands and features`,
    permission: ``,
    cooldown: 3,
    type: `CHAT_INPUT`,
    options: [{
        name: `command`,
        description: `Get information about a specific command`,
        type: `SUB_COMMAND`,
        options: [{
            name: `list1`,
            description: `The name of the feature or command`,
            type: `STRING`,
            required: false,
            choices: [{ name: `about`, value: `about` }, { name: `channelmute`, value: `channelmute` }, { name: `delete`, value: `delete` }, { name: `embed`, value: `embed` }, { name: `help`, value: `help` }, { name: `info`, value: `info` }, { name: `move`, value: `move` }, { name: `resetckq`, value: `resetckq` }, { name: `rule`, value: `rule` }, { name: `warn`, value: `warn` }, { name: `apply`, value: `apply` }, { name: `avatar`, value: `avatar` }, { name: `report`, value: `report` }, { name: `serverinfo`, value: `serverinfo` }, { name: `whois`, value: `whois` }, { name: `menu`, value: `menu` }, { name: `invite`, value: `invite` }, { name: `livenow`, value: `livenow` }, { name: `say`, value: `say` }, { name: `index`, value: `index` }, { name: `modschoice`, value: `modschoice` }, { name: `lockdown`, value: `lockdown` }, { name: `leaderboard`, value: `leaderboard` }, { name: `boost`, value: `boost` }, { name: `rank`, value: `rank` }],
        },
        {
            name: `list2`,
            description: `The name of the feature or command`,
            type: `STRING`,
            required: false,
            choices: [{ name: `xp`, value: `xp` }],
        }]
    },
    {
        name: `menu`,
        description: `The main menu of the help command`,
        type: `SUB_COMMAND`,
        usage: `/help menu`,
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { guild, client, options } = interaction;

        try {
            switch (options.getSubcommand()) {
                case 'command': {
                    const choice = options.getString('list1');
                    const choice2 = options.getString('list2');

                    if (!choice && !choice2) {
                        return interaction.reply({
                            content: `${process.env.BOT_DENY} \`You did not include a command name\``,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    }

                    cmdArr = [];

                    (await PG(`${process.cwd()}/commands/slash_commands/*/*.js`)).map(async (file) => {
                        const command = require(file);

                        if (file.includes('administration')) cmdArr.push({ command, access: 'Administration' });
                        if (file.includes('moderation')) cmdArr.push({ command, access: 'Moderation' });
                        if (file.includes('utility')) cmdArr.push({ command, access: 'Utility' });
                    });

                    const cmd = cmdArr.find(c => c.command.name === choice) || cmdArr.find(c => c.command.name === choice2);

                    const response = new MessageEmbed()
                        .setTitle(`${cmd.access} > ${cmd.command.name.toUpperCase()}`)
                        .setDescription(`${cmd.command.description}`)

                    if (cmd.command.locked) response.addField(`Required Permissions`, `\`Owner\``, false), response.setColor('#87ecff');
                    if (cmd.command.permission === `MANAGE_MESSAGES`) response.addField(`Required Permissions`, `\`Staff\``, false), response.setColor('#fff766');
                    if (cmd.command.permission === ``) response.addField(`Required Permissions`, `\`None\``, false), response.setColor('#ffa116');

                    if (!cmd.command.usage) {
                        cmd.command.options.forEach(option => {
                            response.addField(`Usage (sub-command)`, `\`\`\`${option.usage}\`\`\``, false);
                        });
                    } else {
                        response.addField(`Usage`, `\`\`\`${cmd.command.usage}\`\`\``, false);
                    }

                    interaction.reply({
                        embeds: [response],
                        ephemeral: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                }
            }

            switch (options.getSubcommand()) {
                case 'menu': {
                    cmdArr = [];

                    (await PG(`${process.cwd()}/commands/slash_commands/*/*.js`)).map(async (file) => {
                        const command = require(file);
                        cmdArr.push(command);
                    });

                    ownerCmd = [];
                    modCmds = [];
                    utilCmds = [];

                    cmdArr.forEach(cmd => {
                        if (cmd.locked) ownerCmd.push(cmd.name);
                        if (cmd.permission === 'MANAGE_MESSAGES') modCmds.push(cmd.name);
                        if (cmd.permission === ``) utilCmds.push(cmd.name);
                    });

                    const response = new MessageEmbed()
                        .setColor('#32BEA6')
                        .setTitle(`ℹ️ CreatorBot's Help Menu`)
                        .setDescription(`**[CreatorHub Server Rules](https://discord.com/channels/${process.env.GUILD_ID}/${process.env.RULE_CHAN}) - [Discord ToS](https://discord.com/terms) - [Discord Community Guidelines](https://discord.com/guidelines)**
        
Use \`/help [command]\` for information about a specific command
Parameters inside \`[]\` brackets are mandatory
Parameters inside \`()\` brackets are optional
⠀`)
                        .addField(`👑 Owner`, `\`/${ownerCmd.join(`\`, \`/`)}\`
⠀`, false)
                        .addField(`👮 Staff`, `\`/${modCmds.join(`\`, \`/`)}\`
⠀`, false)
                        .addField(`👥 Everyone`, `\`/${utilCmds.join(`\`, \`/`)}\`
⠀`, false)
                        .setFooter({ text: `${client.user.username} • Created by ProbablyRaging`, iconURL: guild.iconURL({ dynamic: true }) })

                    interaction.reply({
                        embeds: [response],
                        ephemeral: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                }
            }
        } catch (err) {
            console.error(err);
        }
    }
}