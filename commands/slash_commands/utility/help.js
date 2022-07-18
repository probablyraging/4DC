const { ContextMenuInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { promisify } = require('util');
const { glob } = require('glob');
const PG = promisify(glob);
const path = require('path');

module.exports = {
    name: `help`,
    description: `Information about CreatorBot's commands and features`,
    access: '',
    cooldown: 3,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `command`,
        description: `Get information about a specific command`,
        type: ApplicationCommandOptionType.Subcommand,
        options: [{
            name: `owner`,
            description: `A list of owner commands`,
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [{ name: `commandcount`, value: `commandcount` }, { name: `embed`, value: `embed` }, { name: `index`, value: `index` }, { name: `say`, value: `say` }],
        },
        {
            name: `staff`,
            description: `A list of staff commands`,
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [{ name: `autoyt`, value: `autoyt` }, { name: `channelmute`, value: `channelmute` }, { name: `delete`, value: `delete` }, { name: `info`, value: `info` }, { name: `lockdown`, value: `lockdown` }, { name: `ccaudit`, value: `ccaudit` }, { name: `ccaway`, value: `ccaway` }, { name: `ccadd`, value: `ccadd` }, { name: `move`, value: `move` }, { name: `resetspotlight`, value: `resetspotlight` }, { name: `rule`, value: `rule` }, { name: `warn`, value: `warn` }, { name: `xp`, value: `xp` },],
        },
        {
            name: `other`,
            description: `A list of everyone commands`,
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [{ name: `about`, value: `about` }, { name: `avatar`, value: `avatar` }, { name: `boost`, value: `boost` }, { name: `counting`, value: `counting` }, { name: `help`, value: `help` }, { name: `invite`, value: `invite` }, { name: `leaderboard`, value: `leaderboard` }, { name: `livenow`, value: `livenow` }, { name: `ccvideos`, value: `ccvideos` }, { name: `rank`, value: `rank` }, { name: `report`, value: `report` }, { name: `serverinfo`, value: `serverinfo` }, { name: `whois`, value: `whois` },],
        }]
    },
    {
        name: `menu`,
        description: `The main menu of the help command`,
        type: ApplicationCommandOptionType.Subcommand,
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
                    const ownerCommands = options.getString('owner');
                    const staffCommands = options.getString('staff');
                    const otherCommands = options.getString('other');

                    if (!ownerCommands && !staffCommands && !otherCommands) {
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

                    const cmd = cmdArr.find(c => c.command.name === ownerCommands) || cmdArr.find(c => c.command.name === staffCommands) || cmdArr.find(c => c.command.name === otherCommands);

                    const response = new EmbedBuilder()
                        .setTitle(`${cmd.access} > ${cmd.command.name.toUpperCase()}`)
                        .setDescription(`${cmd.command.description}`)

                    if (cmd.command.access === 'owner') response.addFields({ name: `Required Permissions`, value: `\`Owner\``, inline: false }), response.setColor('#87ecff');
                    if (cmd.command.access === `staff`) response.addFields({ name: `Required Permissions`, value: `\`Staff\``, inline: false }), response.setColor('#fff766');
                    if (cmd.command.access === ``) response.addFields({ name: `Required Permissions`, value: `\`None\``, inline: false }), response.setColor('#ffa116');

                    if (!cmd.command.usage) {
                        cmd.command.options.forEach(option => {
                            response.addFields({ name: `Usage (sub-command)`, value: `\`\`\`${option.usage}\`\`\``, inline: false });
                        });
                    } else {
                        response.addFields({ name: `Usage`, value: `\`\`\`${cmd.command.usage}\`\`\``, inline: false });
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
                        if (cmd.access === 'owner') ownerCmd.push(cmd.name);
                        if (cmd.access === 'staff') modCmds.push(cmd.name);
                        if (cmd.access === ``) utilCmds.push(cmd.name);
                    });

                    const response = new EmbedBuilder()
                        .setColor('#32BEA6')
                        .setTitle(`ℹ️ CreatorBot's Help Menu`)
                        .setDescription(`**[CreatorHub Server Rules](https://discord.com/channels/${process.env.GUILD_ID}/${process.env.RULE_CHAN}) - [Discord ToS](https://discord.com/terms) - [Discord Community Guidelines](https://discord.com/guidelines)**
        
Use \`/help [command]\` for information about a specific command
Parameters inside \`[]\` brackets are mandatory
Parameters inside \`()\` brackets are optional
⠀`)
                        .addFields({ name: `👑 Owner`, value: `\`/${ownerCmd.join(`\`, \`/`)}\`
⠀`, inline: false },
                        { name: `👮 Staff`, value: `\`/${modCmds.join(`\`, \`/`)}\`
⠀`, inline: false },
                        { name: `👥 Everyone`, value: `\`/${utilCmds.join(`\`, \`/`)}\`
⠀`, inline: false },)
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