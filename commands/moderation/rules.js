const { ContextMenuInteraction } = require('discord.js');
const { rules } = require('../../validation/ruleList');

module.exports = {
    name: `rules`,
    description: `Reminds a user to not be an a-hole`,
    permission: `MANAGE_MESSAGES`,
    type: `CHAT_INPUT`,
    options: [{
        name: `number`,
        description: `The number of the rule you wish to reference`,
        type: `NUMBER`,
        required: true
    },
    {
        name: `username`,
        description: `The user you wish to direct the reminder to`,
        type: `USER`,
        required: true
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { options } = interaction;

        const ruleNum = options.getNumber('number');
        const target = options.getMember('username');

        interaction.reply({
            content: `${target}
**Rule ${ruleNum}** - ${rules[ruleNum - 1]}`
        });
    }
}