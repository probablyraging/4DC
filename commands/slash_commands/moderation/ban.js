const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

module.exports = {
    name: `ban`,
    description: `Ban a user from the server`,
    defaultMemberPermissions: ['ModerateMembers'],
    cooldown: 30,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `user`,
        description: `The user you want to ban`,
        type: ApplicationCommandOptionType.User,
        required: true
    },
    {
        name: `delete_messages`,
        description: `Delete this users recent messages`,
        type: ApplicationCommandOptionType.Boolean,
        required: true
    },
    {
        name: `reason`,
        description: `The reason for banning the user`,
        type: ApplicationCommandOptionType.String,
        required: true
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { member, guild, options } = interaction;

        await interaction.deferReply({ ephemeral: true });

        const target = options.getMember('user');
        const deleteMessages = options.getBoolean('delete_messages');
        const reason = options.getString('reason');
        const logChan = guild.channels.cache.get(process.env.LOG_CHAN);

        await target.send({
            content: `You have been banned from ForTheContent for "${reason}"\nJoin discord.gg/zt3RhvX3Gb for ban appeals`
        }).catch(() => {});

        if (!deleteMessages) {
            // Ban user
            await target.ban({
                reason: reason
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem banning a user: `, err));
        } else {
            await target.ban({
                deleteMessageSeconds: 604800,
                reason: reason
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem banning a user: `, err));
        }

        // Log to channel
        let log = new EmbedBuilder()
            .setColor("#E04F5F")
            .setAuthor({ name: `${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`**Member:** ${target.user.tag} *(${target.user.id})*
**Reason:** ${reason}`)
            .setFooter({ text: `Ban • ${uuidv4()}`, iconURL: 'https://i.imgur.com/WjgRUio.png' })
            .setTimestamp();

        logChan.send({
            embeds: [log]
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));

        interaction.editReply({
            content: `${target.user.tag} was banned from the server`
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
    }
}