const { ContextMenuInteraction } = require('discord.js');
const { rules } = require('../../../lists/rule-list');
const path = require('path');

module.exports = {
    name: `rules`,
    description: `Remind a user to not be an a-hole`,
    permission: `MANAGE_MESSAGES`,
    type: `CHAT_INPUT`,
    usage: `/rules [ruleNumber] [@username]`,
    options: [{
        name: `number`,
        description: `The number of the rule you want to reference`,
        type: `NUMBER`,
        required: true
    },
    {
        name: `username`,
        description: `The user you want to direct the reminder at`,
        type: `USER`,
        required: true
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    execute(interaction) {
        const { options } = interaction;

        const number = options.getNumber('number');
        const target = options.getMember('username');

        const url = `https://discord.com/channels/${process.env.GUILD_ID}/${process.env.RULE_CHAN}`

        interaction.reply({
            content: `*Please read the rules ${target}:*
> ${process.env.BOT_DOC} **[Rule ${number}](<${url}>)** - ${rules[number - 1]}`
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
    }
}