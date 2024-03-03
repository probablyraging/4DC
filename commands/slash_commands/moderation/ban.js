const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, hyperlink } = require('discord.js');
const { sendResponse } = require('../../../utils/utils');
const { rules } = require('../../../lists/rules');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

module.exports = {
    name: `ban`,
    description: `Ban a user from the server`,
    defaultMemberPermissions: ['ModerateMembers'],
    cooldown: 30,
    global: true,
    dm_permission: false,
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
        required: true,
        choices: [{ name: 'Rule 1 - harmful posts, username, profile, etc..', value: '1' },
        { name: 'Rule 2 - advertising discord servers and paid services', value: '2' },
        { name: 'Rule 3 - breaking another platforms ToS, sub4sub, buying/sellin,g etc..', value: '3' },
        { name: 'Rule 4 - unsolicited DMs', value: '4' },
        { name: 'Rule 5 - self-promotion outside of content share section', value: '5' },
        { name: 'Rule 6 - sending repeated or purposeless message', value: '6' },
        { name: 'Rule 7 - messages not in English', value: '7' },
        { name: 'Custom - please provide a custom reason', value: 'custom' }]
    },
    {
        name: `screenshot`,
        description: `A screenshot of the reason why the user was banned`,
        type: ApplicationCommandOptionType.Attachment,
        required: true
    },
    {
        name: `screenshot2`,
        description: `A screenshot of the reason why the user was banned`,
        type: ApplicationCommandOptionType.Attachment,
        required: false
    },
    {
        name: `screenshot3`,
        description: `A screenshot of the reason why the user was banned`,
        type: ApplicationCommandOptionType.Attachment,
        required: false
    },
    {
        name: `screenshot4`,
        description: `A screenshot of the reason why the user was banned`,
        type: ApplicationCommandOptionType.Attachment,
        required: false
    },
    {
        name: `custom`,
        description: `Provide a reason for banning the user when selecting custom`,
        type: ApplicationCommandOptionType.String,
        required: false
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { member, guild, options } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const logChan = guild.channels.cache.get(process.env.LOG_CHAN);
        const screenshotChan = guild.channels.cache.get(process.env.SCREENSHOT_CHAN);
        const target = options.getUser('user');
        const deleteMessages = options.getBoolean('delete_messages');
        const custom = options.getString('custom');
        const attachment = options.getAttachment('screenshot');
        const attachment2 = options.getAttachment('screenshot2');
        const attachment3 = options.getAttachment('screenshot3');
        const attachment4 = options.getAttachment('screenshot4');
        const logId = uuidv4();
        let reason = options.getString('reason');
        reason = (reason === 'custom') ? custom : rules[Number(reason) - 1];
        let attachmentArr = [];

        // Check all attachment's content type to see if they're a valie image
        const attachments = [attachment, attachment2, attachment3, attachment4];
        for (let i = 0; i < attachments.length; i++) {
            const currentAttachment = attachments[i];
            if (!currentAttachment || !currentAttachment.contentType) continue;
            if (!currentAttachment.contentType || !currentAttachment.contentType.includes('image')) {
                return sendResponse(interaction, `Attachment type must be an image file (.png, .jpg, etc..)`);
            } else {
                attachmentArr.push(currentAttachment);
            }
        }
        // If no target
        if (!target) return sendResponse(interaction, `This user no longer exists`);
        // If no reason was provided when using the custom reason option
        if (reason == null) return sendResponse(interaction, `You must provide custom reason when selecting the 'Custom' option`);
        // Check if a the user is already banned
        const alreadyBanned = await guild.bans.fetch(target.id).catch(() => { });
        if (alreadyBanned) return sendResponse(interaction, `This user is already banned`);
        // Send response
        sendResponse(interaction, `${target.username} was banned from the server`);
        // Send a notification to the target user
        await target.send({
            content: `## You have been banned from **ContentCreator**\n> ${reason}`
        }).catch(() => { });
        // Ban the target user, taking into account if their messages should be deleted
        await guild.bans.create(target, {
            deleteMessageSeconds: deleteMessages ? 604800 : 0,
            reason: reason
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem banning a user: `, err));
        // Send screenshot to channel
        const screenshotMessage = await screenshotChan.send({ content: logId, files: attachmentArr }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

        // Log to channel
        let log = new EmbedBuilder()
            .setColor("#E04F5F")
            .setAuthor({ name: `${member.user.username}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`**Member:** ${target.username} *(${target.id})*
**Reason:** ${reason} \n**Purge Messages:** ${deleteMessages.toString().charAt(0).toUpperCase() + deleteMessages.toString().slice(1)} ${attachment ? `\n**Attachment:** ${hyperlink(screenshotMessage.id, screenshotMessage.url)}` : ""}`)
            .setFooter({ text: `Ban • ${logId}`, iconURL: process.env.LOG_BAN })
            .setTimestamp();

        logChan.send({
            embeds: [log]
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));
    }
}