const { ContextMenuInteraction, ApplicationCommandType, EmbedBuilder } = require('discord.js');
const path = require('path');

module.exports = {
    name: `Whois`,
    description: ``,
    permission: ``,
    cooldown: 5,
    type: ApplicationCommandType.User,
    /**
     *
     * @param {ContextMenuInteraction} interaction
     */
    async execute(interaction) {
        const { guild } = interaction;

        const target = await guild.members.fetch(interaction.targetId).catch(() => {
            interaction.reply({
                content: `${process.env.BOT_DENY} This user no longer exists`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        });

        let acknowledgements = 'None';
        let permissions = [];

        if (target?.permissions.has('Administrator')) {
            permissions.push('Administrator');
            acknowledgements = 'Administrator';
        }
        if (target?.permissions.has('BanMembers')) {
            permissions.push('Ban Members');
        }
        if (target?.permissions.has("ModerateMembers")) {
            permissions.push("Moderate Members");
        }
        if (target?.permissions.has('KickMembers')) {
            permissions.push('Kick Members');
        }
        if (target?.permissions.has('ManageMessages')) {
            permissions.push('Manage Messages');
            acknowledgements = 'Moderator';
        }
        if (target?.permissions.has('ManageChannels')) {
            permissions.push('Manage Channels');
        }
        if (target?.permissions.has('MentionEveryone')) {
            permissions.push('Mention Everyone');
        }
        if (target?.permissions.has('ManageNicknames')) {
            permissions.push('Manage Nicknames');
        }
        if (target?.permissions.has('ManageRoles')) {
            permissions.push('Manage Roles');
            acknowledgements = 'Administrator';
        }
        if (target?.permissions.has('DeafenMembers')) {
            permissions.push('Deafen Members');
            acknowledgements = 'Administrator';
        }
        if (target?.permissions.has('ManageWebhooks')) {
            permissions.push('Manage Webhooks');
        }
        if (target?.permissions.has('ManageEmojisAndStickers')) {
            permissions.push('Manage Emojis and Stickers');
        }
        if (permissions?.length == 0) {
            permissions.push('No Key Permissions Found');
        }
        if (target?.id == guild.ownerId) {
            acknowledgements = 'Server Owner';
        }

        if (target?.presence?.status === 'online') targetStatus = 'Online';
        if (target?.presence?.status === 'idle') targetStatus = 'Idle';
        if (target?.presence?.status === 'dnd') targetStatus = 'Do Not Disturb';
        if (!target?.presence?.status) targetStatus = 'Offline';

        const roles = guild.members.cache.get(target?.id)._roles.length;
        let roleList = `None`;
        if (roles > 0) roleList = `<@&${guild.members.cache.get(target?.id)._roles.join('>, <@&')}>`;

        if (roleList && roleList.length > 1024) {
            return interaction.reply({
                content: `${process.env.BOT_DENY} Role field exceeds 1024 characters`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }

        if (acknowledgements && acknowledgements.length > 1024) {
            return interaction.reply({
                content: `${process.env.BOT_DENY} Acknowledgements field exceeds 1024 characters`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }

        if (permissions && permissions.length > 1024) {
            return interaction.reply({
                content: `${process.env.BOT_DENY} Permissions field exceeds 1024 characters`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }

        const response = new EmbedBuilder()
            .setColor('Random')
            .setAuthor({ name: `${target?.user.tag}`, iconURL: target?.user.displayAvatarURL({ dynamic: true }) })
            .setThumbnail(`${target?.user.displayAvatarURL({ dynamic: true })}`)
            .addFields({ name: `Registered`, value: `<t:${parseInt(target?.user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: `Joined`, value: `<t:${parseInt(target?.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: `Status`, value: `${targetStatus}`, inline: true },
                { name: `Roles`, value: `${roleList}`, inline: false },
                { name: `Acknowledgements`, value: `${acknowledgements}`, inline: false },
                { name: `Permissions`, value: `${permissions.join(`, `)}`, inline: false })
            .setFooter({ text: target?.id })
            .setTimestamp();

        if (target?.user.bot) response.addFields({ name: 'Additional:', value: `This user is a BOT`, inline: false });

        interaction.reply({
            embeds: [response],
            ephemeral: true
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
    }
};
