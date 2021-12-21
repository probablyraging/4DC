const { ContextMenuInteraction } = require('discord.js');
const { rules } = require('../../../validation/rule-list');

module.exports = {
    name: `rules`,
    description: `Reminds a user to not be an a-hole`,
    permission: `MANAGE_MESSAGES`,
    type: `CHAT_INPUT`,
    options: [{
        name: `number`,
        description: `The number of the rule you want to reference`,
        type: `NUMBER`,
        required: true
    },
    {
        name: `username`,
        description: `The user you want to direct the reminder to`,
        type: `USER`,
        required: true
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { options } = interaction;

        const number = options.getNumber('number');
        const target = options.getMember('username');

        const url = `https://discord.com/channels/${process.env.GUILD_ID}/${process.env.RULE_CHAN}`

        await interaction.reply({
            content: `*Please read the rules ${target}:*
> [${process.env.BOT_DOC} **Rule ${number}**](<${url}>) - ${rules[number - 1]}`
        });
    }
}