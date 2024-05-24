import { ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, codeBlock, hyperlink } from 'discord.js';
import { sendFollowUp, sendResponse, dbCreate } from '../../utils/utils.js';
import rules from '../../lists/rules.js';
import warnSchema from '../../schemas/warn_schema.js';
import { v4 as uuidv4 } from 'uuid';

let status = false;
let originalMessageId;
let reportedUser;
export default async (interaction) => {
    const { client, guild, member, customId } = interaction;

    const channel = client.channels.cache.get(interaction.channelId);
    const screenshotChan = guild.channels.cache.get(process.env.SCREENSHOT_CHAN);
    const logChan = guild.channels.cache.get(process.env.LOG_CHAN);

    if (customId.split('-')[1] === 'action') {
        if (status) return;
        status = true;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error('There was a problem deferring an interaction: ', err));

        const reportMessage = await channel.messages.fetch(interaction.message.id);
        const reportEmbed = reportMessage.embeds[0].data;
        const reportedUserId = reportEmbed.fields[0].value.split(/[@>]/)[1];
        reportedUser = await guild.members.fetch(reportedUserId).catch(() => { });
        originalMessageId = reportEmbed.footer.text.split('-')[1];

        // If the reported user is new longer in the server
        if (!reportedUser) {
            closeReport(guild, channel, member);
            return sendResponse(interaction, 'This user no longer exists. This report has been closed');
        }

        // Set the status of the embed to allow other staff to see if someone is currently taking action or not
        const statusUpdate = new EmbedBuilder(reportEmbed)
            .setColor('#ebd086')
            .addFields({ name: 'Status', value: `${member} is taking action`, inline: false });

        // Enable button
        const enabled = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('report-action')
                    .setLabel('Action')
                    .setStyle(ButtonStyle.Primary)
            );
        // Disable button
        const disabled = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('report-action')
                    .setLabel('Action')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true)
            );
        // Action buttons
        const actions = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('report-warn')
                    .setLabel('Warn')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('report-ban')
                    .setLabel('Ban')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('report-close')
                    .setLabel('Close Report')
                    .setStyle(ButtonStyle.Danger)
            );

        // Send the embed with the status and reply with the action buttons
        reportMessage.edit({ embeds: [statusUpdate], components: [disabled] }).catch(err => console.error('There was a problem editing a message ', err));
        await sendFollowUp(interaction, '', [], [], [actions]);

        // Wait 30 seconds, if not action was taken, clear the status
        setTimeout(async () => {
            const reportMessageUpdated = await channel.messages.fetch(interaction.message.id);
            const reportEmbedUpdated = reportMessageUpdated.embeds[0].data;
            if (reportEmbedUpdated.color !== 3325606) {
                // Remove the status
                const embed = new EmbedBuilder(reportEmbed)
                    .setColor('#E04F5F');

                reportMessage.edit({ embeds: [embed], components: [enabled] }).catch(err => console.error('There was a problem editing a message ', err));
                sendResponse(interaction, 'Action expired. Action must be taken within 60 seconds of clicking the **Action** button');
                status = false;
            }
        }, 60000);
    }

    if (customId.split('-')[1] === 'ban' || customId.split('-')[1] === 'warn') {
        await interaction.deferUpdate().catch(err => console.error('There was a problem deferring an interaction: ', err));

        const type = customId.split('-')[1];

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`report-reasons-${type}`)
                    .setPlaceholder('Choose a reason')
                    .addOptions({
                        label: 'Rule 1',
                        description: 'harmful posts, username, profile, etc..',
                        value: '0',
                    }, {
                        label: 'Rule 2',
                        description: 'unsolicited DMs',
                        value: '1',
                    }, {
                        label: 'Rule 3',
                        description: 'advertising discord servers and paid services',
                        value: '2',
                    }, {
                        label: 'Rule 4',
                        description: 'breaking another platforms ToS, sub4sub, buying/sellin,g etc..',
                        value: '3',
                    }, {
                        label: 'Rule 5',
                        description: 'self-promotion outside of content share section',
                        value: '4',
                    }, {
                        label: 'Rule 6',
                        description: 'sending repeated or purposeless message',
                        value: '5',
                    }, {
                        label: 'Rule 7',
                        description: 'messages not in English',
                        value: '6',
                    }));

        sendResponse(interaction, '', [], [], [row]);
    }

    if (customId.split('-')[1] === 'reasons') {
        await interaction.deferUpdate().catch(err => console.error('There was a problem deferring an interaction: ', err));

        if (customId.split('-')[2] === 'ban') {
            const reportMessage = await channel.messages.fetch(originalMessageId);
            const reportEmbed = reportMessage.embeds[0].data;
            const attachment = reportEmbed.image?.url;
            const value = interaction.values[0];
            const reason = rules[value];
            const logId = uuidv4();

            interaction.deleteReply().catch(err => console.error('There was a problem deleting an interaction: ', err));
            // Close report
            closeReport(guild, channel, member);

            // Send a notification to the target user
            await reportedUser.send({
                content: `## You have been banned from **ContentCreator**\n> ${reason}`
            }).catch(() => { });

            // Ban the user
            await guild.bans.create(reportedUser.user, {
                reason: reason
            }).catch(err => console.error('There was a problem banning a user: ', err));

            // Send screenshot to channel
            let screenshotMessage;
            if (attachment) screenshotMessage = await screenshotChan.send({ content: logId, files: [attachment] })
                .catch(err => console.error('There was a problem sending a message: ', err));

            // Log to channel
            let log = new EmbedBuilder()
                .setColor('#E04F5F')
                .setAuthor({ name: `${member.user.username}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                .setDescription(`**Member:** ${reportedUser.user.username} *(${reportedUser.id})*
**Reason:** ${reason} ${attachment ? `\n**Attachment:** ${hyperlink(screenshotMessage.id, screenshotMessage.url)}` : ''}`)
                .setFooter({ text: `Ban • ${logId}`, iconURL: process.env.LOG_BAN })
                .setTimestamp();

            logChan.send({
                embeds: [log]
            }).catch(err => console.error('There was a problem sending an embed: ', err));
        }

        if (customId.split('-')[2] === 'warn') {
            const guildId = guild.id;
            const target = reportedUser;
            const userId = target?.id;
            const username = target?.user.username;
            const authorTag = member.user.username;
            const warnId = uuidv4();
            const author = member.id;
            const timestamp = new Date().getTime();
            const value = interaction.values[0];
            const reason = rules[value];

            // If the target user cannot be found
            if (!userId || !username) {
                closeReport(guild, channel, member);
                return sendResponse(interaction, 'The was an issue finding the user you are trying to warn. This report has been closed');
            }

            // Log to channel
            let log = new EmbedBuilder()
                .setColor('#E04F5F')
                .setAuthor({ name: `${member.user.username}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                .setDescription(`**Member:** ${reportedUser.user.username} *(${reportedUser.id})* \n**Reason:** ${reason}`)
                .setFooter({ text: `Warning Added • ${warnId}`, iconURL: process.env.LOG_WARN })
                .setTimestamp();

            logChan.send({
                embeds: [log]
            }).catch(err => console.error('There was a problem sending an embed: ', err));

            // Log to database
            await dbCreate(warnSchema, { guildId, userId, username, warnId, author, authorTag, timestamp, reason });
            // Fetch warnings for the target user
            const results = await warnSchema.find({ guildId, userId });

            if (results.length >= 3) {
                // Ban the user if this is their third warning
                await guild.bans.create(reportedUser.user, {
                    reason: 'Warning threshold'
                }).catch(err => console.error('There was a problem banning a user: ', err));
            } else {
                // Notify the user that they received a warning
                await target.send({ content: `${target} - you received a warning in ${guild.name} \n${codeBlock(reason)}` })
                    .catch(err => console.error('There was a problem sending a user a warning DM: ', err));
            }

            interaction.deleteReply().catch(err => console.error('There was a problem deleting an interaction: ', err));
            // Close report
            closeReport(guild, channel, member);
        }
    }

    if (customId.split('-')[1] === 'close') {
        await interaction.deferUpdate().catch(err => console.error('There was a problem deferring an interaction: ', err));
        interaction.deleteReply().catch(err => console.error('There was a problem deleting an interaction: ', err));
        // Close report
        closeReport(guild, channel, member);
    }
};

async function closeReport(guild, channel, member) {
    const reportMessage = await channel.messages.fetch(originalMessageId);
    const reportEmbed = reportMessage.embeds[0].data;
    const reporterId = reportEmbed.footer.text.split('-')[0].replace('ID ', '');
    const reporterUser = await guild.members.fetch(reporterId).catch(() => { });

    reportEmbed.fields[2] = { name: '', value: '' };
    const closedEmbed = new EmbedBuilder(reportEmbed)
        .setColor('#32BEA6')
        .addFields({ name: 'Closed By', value: `${member}`, inline: false });

    reportMessage.edit({ embeds: [closedEmbed], components: [] }).catch(err => console.error('There was a problem editing a message ', err));

    const replyEmbed = new EmbedBuilder(reportEmbed)
        .setColor('#32BEA6')
        .setTitle('Server Report')
        .setDescription('Your report\'s status has been updated to `CLOSED`');

    if (reporterUser) reporterUser.send({ embeds: [replyEmbed] }).catch(err => console.error('There was a problem sending a message ', err));
    status = false;
}