const { ContextMenuInteraction, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { rules } = require('../../../lists/rules');
const path = require('path');

module.exports = {
    name: `rule`,
    description: `Remind a user to not be an a-hole`,
    cooldown: 3,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `number`,
        description: `The number of the rule you are referencing`,
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [{ name: 'Rule 1 - harmful post/username/profile etc..', value: '1' },
        { name: 'Rule 2 - spamming and flooding', value: '2' },
        { name: 'Rule 3 - self promotion and unsolicited DMs', value: '3' },
        { name: 'Rule 4 - advertising discord servers and paid services', value: '4' },
        { name: 'Rule 5 - behaviour breaking platform ToS', value: '5' },
        { name: 'Rule 6 - openly discussing moderator actions', value: '6' },
        { name: 'Rule 7 - messages not in English', value: '7' }]
    },
    {
        name: `username`,
        description: `The user you want to direct the reminder at`,
        type: ApplicationCommandOptionType.User,
        required: true
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    execute(interaction) {
        const { options } = interaction;

        const number = options.getString('number');
        const target = options.getMember('username');

        const url = `https://discord.com/channels/${process.env.GUILD_ID}/${process.env.RULE_CHAN}`

        interaction.reply({
            content: `*Please read the rules ${target}:*
> ${process.env.BOT_DOC} **[Rule ${number}](<${url}>)** - ${rules[number - 1]}`
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
    }
}