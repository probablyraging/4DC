const { ContextMenuInteraction, MessageEmbed } = require('discord.js');
const moment = require('moment');

module.exports = {
    name: 'whois',
    description: '',
    permission: '',
    type: 'USER',
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const target = await interaction.guild.members.fetch(interaction.targetId);

        acknowledgements = null
        permissions = [];

        if (target.permissions.has("ADMINISTRATOR")) {
            permissions.push("Administrator");
            acknowledgements = 'Administrator';
        }
        if (target.permissions.has("BAN_MEMBERS")) {
            permissions.push("Ban Members");
        }
        if (target.permissions.has("KICK_MEMBERS")) {
            permissions.push("Kick Members");
        }
        if (target.permissions.has("MANAGE_MESSAGES")) {
            permissions.push("Manage Messages");
            acknowledgements = 'Moderator';
        }
        if (target.permissions.has("MANAGE_CHANNELS")) {
            permissions.push("Manage Channels");
        }
        if (target.permissions.has("MENTION_EVERYONE")) {
            permissions.push("Mention Everyone");
        }
        if (target.permissions.has("MANAGE_NICKNAMES")) {
            permissions.push("Manage Nicknames");
        }
        if (target.permissions.has("MANAGE_ROLES")) {
            permissions.push("Manage Roles");
            acknowledgements = 'Administrator';
        }
        if (target.permissions.has("DEAFEN_MEMBERS")) {
            permissions.push("Deafen Members");
            acknowledgements = 'Administrator';
        }
        if (target.permissions.has("MANAGE_WEBHOOKS")) {
            permissions.push("Manage Webhooks");
        }
        if (target.permissions.has("MANAGE_EMOJIS_AND_STICKERS")) {
            permissions.push("Manage Emojis");
        }
        if (permissions.length == 0) {
            permissions.push("No Key Permissions Found");
        }
        if (target.id == interaction.guild.ownerId) {
            acknowledgements = 'Server Owner';
        }

        if (target.presence.status === 'online') targetStatus = 'Online';
        if (target.presence.status === 'offline') targetStatus = 'Offline';
        if (target.presence.status === 'idle') targetStatus = 'Idle';
        if (target.presence.status === 'dnd') targetStatus = 'Do Not Disturb';

        const response = new MessageEmbed()
            .setAuthor(`${target.user.tag}`, `${target.user.avatarURL({ dynamic: true })}`)
            .setColor('RANDOM')
            .setThumbnail(`${target.user.avatarURL({ dynamic: true })}`)
            .addField('Registered:', `<t:${parseInt(target.user.createdTimestamp / 1000)}:R>`, true)
            .addField('Joined:', `<t:${parseInt(target.joinedTimestamp / 1000)}:R>`, true)
            .addField('Status:', `${targetStatus}`, true)
            .addField('Roles:', `<@&${interaction.guild.members.cache.get(target.id)._roles.join('>, <@&')}>`, false)
            .addField('Acknowledgements:', `${acknowledgements}`, true)
            .addField('Permissions:', `${permissions.join(`, `)}`, false)
            .setFooter(`ID: ${target.id}`)
            .setTimestamp()

        interaction.reply({
            embeds: [response],
            ephemeral: true
        })
    }
}