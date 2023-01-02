const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

module.exports = {
    name: `unban`,
    description: `Unban a user from the server`,
    defaultMemberPermissions: ['ModerateMembers'],
    cooldown: 30,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `user_id`,
        description: `The ID of the user you want to unban`,
        type: ApplicationCommandOptionType.String,
        required: true
    },
    {
        name: `reason`,
        description: `The reason for unbanning the user`,
        type: ApplicationCommandOptionType.String,
        required: true
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { member, guild, options } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const target = options.getString('user_id');
        const reason = options.getString('reason');
        const logChan = guild.channels.cache.get(process.env.LOG_CHAN);
        let error;

        if (isNaN(target)) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} A user ID must contain only numbers`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        };

        const fetchBan = await guild.bans.fetch(target).catch(() => { error = true });

        await guild.bans.remove(target, { reason: reason }).catch(() => { error = true });

        if (error) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} ${target} was not found in the ban list`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }

        // Log to channel
        let log = new EmbedBuilder()
            .setColor("#4fe059")
            .setAuthor({ name: `${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`**Member:** ${fetchBan.user.tag} *(${fetchBan.user.id})*
        **Reason:** ${reason}`)
            .setFooter({ text: `Unban • ${uuidv4()}`, iconURL: 'https://i.imgur.com/WjgRUio.png' })
            .setTimestamp();

        logChan.send({
            embeds: [log]
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));

        interaction.editReply({
            content: `${process.env.BOT_CONF} ${fetchBan.user.tag} was unbanned from the server`
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
    }
}