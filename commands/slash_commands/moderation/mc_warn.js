const {ContextMenuInteraction} = require('discord.js');
const {deleteWarning, getWarnings, addWarning} = require('../../../modules/mods_choice/mods_choice_warning_data');
const {ModsChoiceWarningType} = require('../../../modules/mods_choice/mods_choice_constants');
const {notifyUser} = require('../../../modules/notify/notify_utils');
const {v4: uuidv4} = require('uuid');
const path = require('path');

async function fetchWarnings(target) {
    let warnings;
    if (target) {
        // Get warnings for a given user
        warnings = await getWarnings(target.id);
    } else {
        // Get all warnings
        warnings = await getWarnings(null);
    }
    return warnings;
}

function buildResponse(warnings) {
    let response;
    if (warnings.length === 0) {
        response = "There were no warnings.";
    } else {
        response = "The following warnings exist:";
        warnings.forEach(warning => {
            let userId = warning.userId;
            let warnedBy = warning.warnedBy;
            let date = new Date(warning.timestamp).toISOString();
            let warnId = warning.warnId;
            let reason = warning.reason;
            response += `\n> <@${userId}> was warned by <@${warnedBy}> on ${date} with warning ID ${warnId} for reason ${reason}.`;
            if (warning.messageUrl) {
                response += ` Associated message: ${warning.messageUrl}`;
            }
        });
    }
    return response;
}

module.exports = {
    name: `mcwarn`,
    description: `Add, remove or list warnings for mods-choice members`,
    permission: `MODERATE_MEMBERS`,
    cooldown: 10,
    type: `CHAT_INPUT`,
    options: [
        {
            name: `add`,
            description: `Add a warning to a specific user`,
            type: `SUB_COMMAND`,
            usage: `/mcwarn add [reason] [username] (messageId)`,
            options: [
                {
                    name: `reason`,
                    description: `The reason for this warning`,
                    type: `STRING`,
                    required: true,
                    choices: [
                        {
                            name: ModsChoiceWarningType.LACK_OF_TABS.name,
                            value: ModsChoiceWarningType.LACK_OF_TABS.value
                        },
                        {
                            name: ModsChoiceWarningType.HAS_NOT_POSTED_PROOF.name,
                            value: ModsChoiceWarningType.HAS_NOT_POSTED_PROOF.value
                        }
                    ]
                },
                {
                    name: `username`,
                    description: `The user you want to add a warning to`,
                    type: `USER`,
                    required: true
                },
                {
                    name: `message`,
                    description: `A message URL to associate with the warning`,
                    type: `STRING`,
                    required: false
                }
            ]
        },
        {
            name: `remove`,
            description: `Remove a specific warning ID`,
            type: `SUB_COMMAND`,
            usage: `/mcwarn remove [warningId]`,
            options: [
                {
                    name: `warning`,
                    description: `The warning ID you want to remove`,
                    type: `STRING`,
                    required: true
                }
            ]
        },
        {
            name: `list`,
            description: `List warnings for a specific active user, or for all active mods choice users`,
            type: `SUB_COMMAND`,
            usage: `/mcwarn list (@username)`,
            options: [
                {
                    name: `username`,
                    description: `The user whose warnings you want to list`,
                    type: `USER`,
                    required: false
                }
            ]
        },
        {
            name: `history`,
            description: `List all warnings for all active and inactive mods choice users`,
            type: `SUB_COMMAND`,
            usage: `/mcwarn history`
        }
    ],
    /**
     *
     * @param {ContextMenuInteraction} interaction
     */
    async execute(interaction) {
        const {guild, user, options} = interaction;

        await interaction.deferReply({ephemeral: true});

        switch (options.getSubcommand()) {
            case 'add': {
                const reason = options.getString('reason');
                const target = options.getMember('username');
                const messageUrl = options.getString('message');

                let userId = target.id;
                let warnId = uuidv4();
                let warnedBy = user.id;

                // Add warning
                await addWarning(userId, warnId, warnedBy, reason, messageUrl ? messageUrl : null);

                let message;
                if (reason === ModsChoiceWarningType.LACK_OF_TABS.value) {
                    message = `The mods choice proof that you provided did not contain enough tabs.\nPlease ensure that you watch _all_ videos that are posted. You can use the \`/mcvideos\` command to get a list of videos to watch.\nIf you believe this is an error, then please contact a member of the CreatorHub Staff.`;
                } else if (reason === ModsChoiceWarningType.HAS_NOT_POSTED_PROOF.value) {
                    message = `You have not posted to mods choice recently.\nPlease ensure that you post screenshots of the videos you watched _at least_ every 3 days. You can use the \`/mcvideos\` command to get a list of videos to watch.\nIf you believe this is an error, then please contact a member of the CreatorHub Staff.`;
                } else {
                    console.error(`${path.basename(__filename)} The reason '${reason}' for the mods choice warning is unsupported.`);
                    await interaction.editReply(`The warning reason '${reason} is invalid.'`)
                        .catch(err => console.error("There was a problem replying to the interaction: ", err));
                    break;
                }
                // Notify user
                notifyUser(target, message, null);

                // Respond to interaction
                await interaction.editReply(`The warning ${warnId} has been added to user ${target}.`)
                    .catch(err => console.error("There was a problem replying to the interaction: ", err));
                break;
            }
            case 'remove': {
                const warningId = options.getString('warning');

                // Remove warning
                await deleteWarning(warningId);

                // Respond to interaction
                await interaction.editReply(`The warning ${warningId} has been deleted.`)
                    .catch(err => console.error("There was a problem replying to the interaction: ", err));

                break;
            }
            case 'list': {
                const target = options.getMember('username');

                let warnings = await fetchWarnings(target);

                // Filter warnings to only active mods choice members
                const mcRole = guild.roles.cache.get(process.env.MCHOICE_ROLE);
                const staffRole = guild.roles.cache.get(process.env.STAFF_ROLE);
                const modsRole = guild.roles.cache.get(process.env.MOD_ROLE);
                let activeMembers = mcRole.members.map(m => m.id)
                    .concat(staffRole.members.map(m => m.id))
                    .concat(modsRole.members.map(m => m.id))
                    .filter((value, index, array) => array.indexOf(value) === index);

                let activeWarnings = [];
                await warnings.forEach(warning => {
                    if (activeMembers.includes(warning.userId)) {
                        activeWarnings.push(warning);
                    }
                });

                // Respond to interaction
                let response = buildResponse(activeWarnings);
                await interaction.editReply(response)
                    .catch(err => console.error("There was a problem replying to the interaction: ", err));
                break;
            }
            case 'history': {
                let warnings = await fetchWarnings(null);

                // Respond to interaction
                let response = buildResponse(warnings);
                await interaction.editReply(response)
                    .catch(err => console.error("There was a problem replying to the interaction: ", err));
                break;
            }
        }
    }
}