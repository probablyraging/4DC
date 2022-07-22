const { ContextMenuInteraction, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const path = require('path');

module.exports = {
    name: `ccadd`,
    description: `Add a user to the Creator Crew role`,
    access: 'staff',
    cooldown: 3,
    type: ApplicationCommandType.ChatInput,
    usage: `/ccadd [@username]`,
    options: [{
        name: `username`,
        description: `The user you want to add to Creator Crew`,
        type: ApplicationCommandOptionType.User,
        required: true,
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    execute(interaction) {
        const { guild, options } = interaction;

        const target = options.getMember('username');

        const mcChan = guild.channels.cache.get(process.env.CCREW_CHAN);
        const mcRole = guild.roles.cache.get(process.env.CCREW_ROLE);

        target.roles.add(mcRole).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));

        mcChan.send({
            content: `${process.env.BOT_CONF} Added ${target} to Creator Crew`
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

        interaction.reply({
            content: `${process.env.BOT_CONF} Added ${target} to Creator Crew`,
            ephemeral: true
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
    }
}