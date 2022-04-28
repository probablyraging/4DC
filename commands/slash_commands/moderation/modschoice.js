const { ContextMenuInteraction } = require('discord.js');
const path = require('path');

module.exports = {
    name: `modschoice`,
    description: `Add a user to the mod's choice role`,
    cooldown: 3,
    type: `CHAT_INPUT`,
    usage: `/modschoice [@username]`,
    options: [{
        name: `username`,
        description: `The user you want to add to mod's choice`,
        type: `USER`,
        required: true,
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    execute(interaction) {
        const { guild, options } = interaction;

        const target = options.getMember('username');

        const mcChan = guild.channels.cache.get(process.env.MCHOICE_CHAN);
        const mcRole = guild.roles.cache.get(process.env.MCHOICE_ROLE);

        target.roles.add(mcRole).catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));

        mcChan.send({
            content: `${process.env.BOT_CONF} \`Added ${target.user.tag} to Mod's Choice\``
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

        interaction.reply({
            content: `${process.env.BOT_CONF} \`Added ${target.user.tag} to Mod's Choice\``,
            ephemeral: true
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
    }
}