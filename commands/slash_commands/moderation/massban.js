const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, TextInputBuilder, ModalBuilder } = require('discord.js');
const { sendResponse } = require('../../../utils/utils');
const massbanSchema = require('../../../schemas/misc/mass_ban_schema');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

/**
 * Deny a mass ban request.
 *
 * @param {CommandInteraction} interaction
 * @param {string} users The users to ban
 * @param {string} reason The reason for banning the users
 */
async function banUsers(interaction, users, reason) {
    let { guild } = interaction;

    const oneDay = 24 * 60 * 60 * 1000;
    // Split the users string into an array of user tags
    const userList = users.split(/\r?\n/);
    let fetchedMemberArrays = await guild.members.fetch().catch(() => { });
    let bannedUsers = [];
    let skippedUsers = [];
    for (let fetchedMemberArray of fetchedMemberArrays) {
        // Get the user's tag from the fetched member array
        let fetchedMember = fetchedMemberArray[1];
        let memberId = fetchedMember?.id;
        // If the member is in the list of users to ban
        if (userList.includes(memberId)) {
            // Get the timestamp for when the member joined the server
            let joinedAt = fetchedMember.joinedTimestamp;
            // Add users who joined less then 24 hours ago to an array and ban them
            if ((new Date() - joinedAt) > oneDay) {
                console.log(`${path.basename(__filename)} Member ${memberId} was not banned as they joined more than 1 day ago.`);
                skippedUsers.push(memberId);
            } else {
                console.log(`${path.basename(__filename)} Banning ${memberId} who joined at ${new Date(joinedAt).toISOString()}.`);
                bannedUsers.push(memberId);
                await fetchedMember.ban({ reason: reason, days: 7 })
                    .catch(err => console.error(`${path.basename(__filename)} Failed to ban user ${memberId}: `, err));
            }
        }
    }
    // Return the arrays
    return { skippedUsers: skippedUsers, bannedUsers: bannedUsers }
}

/**
 * Approve a mass ban request.
 *
 * @param {CommandInteraction} interaction
 */
async function approveMassBan(interaction) {
    let { member, guild, options } = interaction;
    await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));
    let id = options.getString('id');

    // Find the mass ban request and check if it is pending
    let result = await massbanSchema.findOne({ id: id }).exec()
        .catch(err => console.error(`${path.basename(__filename)} There was a problem fetching away users from the database: `, err));
    // If the request is found and is pending 
    if (result && result.state === "PENDING") {
        let author = result.author;
        let currentUser = member.user.username;
        // Check if the current user is the one who requested the mass ban
        if (author === currentUser) {
            sendResponse(interaction, `${process.env.BOT_DENY} The mass ban request with ID '${id}' cannot be approved by the same person who requested it`);
        } else {
            result.state = "BANNING";
            result.save();

            const staffChannel = guild.channels.cache.get(process.env.STAFF_CHAN);
            let reason = result.reason;
            // Ban the users
            let banResults = await banUsers(interaction, result.users, reason);

            // Set the state to approved and send a message to the staff channel
            result.state = "APPROVED";
            result.save();

            let bannedUsers = banResults.bannedUsers.join("\n");
            let skippedUsers = banResults.skippedUsers.join("\n");
            const staffEmbed = new EmbedBuilder()
                .setColor('#44ff00')
                .setAuthor({ name: `${member?.user.username}`, iconURL: member?.user.displayAvatarURL({ dynamic: true }) })
                .setDescription(`Mass Ban Request Processed`)
                .addFields({ name: `Request ID`, value: id, inline: false },
                    { name: `Reason`, value: reason, inline: false },
                    { name: `Banned User`, value: bannedUsers ? bannedUsers : "None", inline: false },
                    { name: `Skipped Users`, value: skippedUsers ? skippedUsers : "None", inline: false })

            staffChannel.send({
                embeds: [staffEmbed]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

            sendResponse(interaction, `${process.env.BOT_CONF} The mass ban request with ID '${id}' has been approved`);
        }
    } else if (result && result.state === "BANNING") {
        // If the ban request is already in the process of banning
        sendResponse(interaction, `${process.env.BOT_INFO} The mass ban request with ID '${id}' has already been approved by another staff member`);
    } else {
        // If there is not pending ban request
        sendResponse(interaction, `${process.env.BOT_DENY} Could not find a pending mass ban request with ID '${id}'`);
    }
}

/**
 * Deny a mass ban request.
 *
 * @param {CommandInteraction} interaction
 */
async function denyMassBan(interaction) {
    let { options, member, guild } = interaction;
    await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));
    let id = options.getString('id');

    // Find the mass ban request
    let result = await massbanSchema.findOne({ id: id }).exec()
        .catch(err => console.error(`${path.basename(__filename)} There was a problem fetching away users from the database: `, err));
    // If the request is found and is pending 
    if (result && result.state === "PENDING") {
        // Set the state to denied and send a message to the staff channel
        result.state = "DENIED";
        result.save();

        const staffChannel = guild.channels.cache.get(process.env.STAFF_CHAN);

        const staffEmbed = new EmbedBuilder()
            .setColor('#ff8400')
            .setAuthor({ name: `${member?.user.username}`, iconURL: member?.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`Mass Ban Request Denied`)
            .addFields({ name: "Request ID", value: id, inline: false })

        staffChannel.send({
            embeds: [staffEmbed]
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

        sendResponse(interaction, `${process.env.BOT_CONF} The mass ban request with ID '${id}' has been denied`);
    } else {
        sendResponse(interaction, `${process.env.BOT_DENY} Could not find a pending mass ban request with ID '${id}'`);
    }
}

/**
 * Create a mass ban request modal.
 *
 * @param {CommandInteraction} interaction
 */
async function createMassBanRequest(interaction) {
    const modal = new ModalBuilder()
        .setTitle('Mass Ban Form')
        .setCustomId('massban-modal');

    const usersRow = new ActionRowBuilder().addComponents([
        new TextInputBuilder()
            .setCustomId('user-list')
            .setLabel('User List to Ban (1 per line)')
            .setStyle(1)
            .setPlaceholder('Username and tag (e.g: ProbablyRaging#0001) - 1 per line')
            .setMinLength(1)
            .setMaxLength(1000)
            .setRequired(true)
            .setStyle(2)
    ]);

    const reasonRow = new ActionRowBuilder().addComponents([
        new TextInputBuilder()
            .setCustomId('reason')
            .setLabel('Reason For Ban')
            .setStyle(1)
            .setPlaceholder('Reason')
            .setMinLength(1)
            .setMaxLength(255)
            .setRequired(true)
            .setStyle(1)
    ]);

    modal.addComponents(usersRow, reasonRow);

    await interaction.showModal(modal);
}

module.exports = {
    name: `massban`,
    description: `Ban a list of users who have been in the server for less than a day.`,
    defaultMemberPermissions: ['ManageRoles'],
    cooldown: 5,
    dm_permission: false,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: `create`,
            description: `Create a mass ban of multiple new users.`,
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: `approve`,
            description: `Approve a mass ban request.`,
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: `id`,
                description: `The mass ban ID to approve.`,
                type: ApplicationCommandOptionType.String,
                required: true
            }]
        },
        {
            name: `deny`,
            description: `Deny a mass ban request.`,
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: `id`,
                description: `The mass ban ID to deny.`,
                type: ApplicationCommandOptionType.String,
                required: true
            }]
        }
    ],

    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        let { options } = interaction;
        switch (options.getSubcommand()) {
            case 'create': {
                await createMassBanRequest(interaction);
                break;
            }
            case 'approve': {
                await approveMassBan(interaction);
                break;
            }
            case 'deny': {
                await denyMassBan(interaction);
                break;
            }
        }
    }
}
