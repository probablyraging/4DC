// eslint-disable-next-line no-unused-vars
import { CommandInteraction, ApplicationCommandType, EmbedBuilder } from 'discord.js';
import { sendResponse } from '../../../utils/utils.js';

export default {
    name: 'Whois',
    cooldown: 5,
    dm_permission: false,
    type: ApplicationCommandType.User,
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const { guild } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error('There was a problem deferring an interaction: ', err));

        const target = await guild.members.fetch(interaction.targetId).catch(() => { });

        // If no target
        if (!target) return sendResponse(interaction, 'This user no longer exists');

        // Filter the target's permissions in an array
        const permissions = target.permissions.toArray();
        const sortedPermissionsArray = permissions.sort();
        const formattedPermissions = sortedPermissionsArray.join(', ');
        const acknowledgements = target?.user.bot ? 'Server Bot' :
            interaction.targetId === guild.ownerId
                ? 'Server Owner'
                : (permissions.includes('ManageRoles')
                    ? 'Server Administrator'
                    : (permissions.includes('ManageMessages')
                        ? 'Server Moderator'
                        : 'None'));
        // Trim the acknowledgements if they exceed the character limit
        if (acknowledgements && acknowledgements.length > 1024) acknowledgements.slice(0, 10);
        if (formattedPermissions && formattedPermissions.length > 1024) formattedPermissions.slice(0, 10);
        // If the target has no permissions
        if (formattedPermissions.length == 0) permissions.push('No Key Permissions Found');
        // Get the targets current presence
        let targetStatus;
        if (target?.presence?.status === 'online') targetStatus = 'Online';
        if (target?.presence?.status === 'idle') targetStatus = 'Idle';
        if (target?.presence?.status === 'dnd') targetStatus = 'Do Not Disturb';
        if (!target?.presence?.status || target?.presence?.status === 'undefined') targetStatus = 'Offline';
        // Create a response embed
        const response = new EmbedBuilder()
            .setAuthor({ name: `${target?.user.username}`, iconURL: target?.user.displayAvatarURL({ dynamic: true }) })
            .setColor('Random')
            .setThumbnail(`${target?.user.displayAvatarURL({ dynamic: true })}`)
            .addFields(
                { name: 'Registered', value: `<t:${parseInt(target?.user.createdTimestamp / 1000)}> \n*(<t:${parseInt(target?.user.createdTimestamp / 1000)}:R>)*`, inline: true },
                { name: 'Joined', value: `<t:${parseInt(target?.joinedTimestamp / 1000)}> \n*(<t:${parseInt(target?.joinedTimestamp / 1000)}:R>)*`, inline: true },
                { name: 'Status', value: `${targetStatus}`, inline: false },
                { name: 'Acknowledgements', value: `${acknowledgements}`, inline: false },
                { name: 'Permissions', value: `${formattedPermissions}`, inline: false })
            .setFooter({ text: target?.id })
            .setTimestamp();

        sendResponse(interaction, '', [response]);
    }
};
