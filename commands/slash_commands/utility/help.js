const { ContextMenuInteraction, MessageEmbed } = require('discord.js');
const { promisify } = require('util');
const { glob } = require('glob');
const PG = promisify(glob);

module.exports = {
    name: `help`,
    description: `Information about CreatorBot and it's features and commands`,
    permission: ``,
    type: `CHAT_INPUT`,
    usage: `/help [commandName]`,
    options: [{
        name: `featureorcommand`,
        description: `The name of the feature or command`,
        type: `STRING`,
        required: true,
        choices: [{ name: `channelmute`, value: `channelmute` }, { name: `delete`, value: `delete` }, { name: `embed`, value: `embed` }, { name: `info`, value: `info` }, { name: `move`, value: `move` }, { name: `rules`, value: `rules` }, { name: `warn`, value: `warn` }, { name: `apply`, value: `apply` }, { name: `avatar`, value: `avatar` }, { name: `help`, value: `help` }, { name: `report`, value: `report` }, { name: `serverinfo`, value: `serverinfo` }, { name: `whois`, value: `whois` }],
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { options } = interaction;

        const choice = options.getString('featureorcommand');

        commandsArr = [];

        (await PG(`${process.cwd()}/commands/slash_commands/*/*.js`)).map(async (file) => {
            const command = require(file);
            commandsArr.push(command);
        });

        let perm = 'Utility';
        let color = '#3fa6ff';

        const cmd = commandsArr.find(c => c.name === choice);

        if (cmd.permission === 'ADMINISTRATOR') perm = 'Administration', color = '#ff6500';
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
    }
}