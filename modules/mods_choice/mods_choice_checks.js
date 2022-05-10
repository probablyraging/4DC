require("dotenv").config();
const path = require("path");
const mcData = require("./mods_choice_data");
const {getYoutubeVideoId, attachmentIsImage} = require("./mods_choice_utils");
const {interval, threeDays, fourDays, fiveDays, oneMonth, ModsChoiceWarningType} = require("./mods_choice_constants");
const {addWarning} = require("./mods_choice_warning_data");
const {v4: uuidv4} = require('uuid');

/**
 * @param {String[]} messageIds A list of Discord Message.ids to delete
 * @param {TextChannel} channel The channel to delete messages from
 */
async function deleteMessages(messageIds, channel) {
    messageIds.forEach(messageId => {
        channel.messages.fetch(messageId)
            .then(messages => {
                if (messages instanceof Map) {
                    messages.first().delete();
                } else {
                    messages.delete();
                }
            })
            .catch(err => console.error(`${path.basename(__filename)} There was a problem finding and deleting a message: `, err));
    });
}

/**
 * @param {GuildMember} guildMember A Discord Member to notify
 * @param {TextChannel} channel The Discord Channel the user is being notified about
 * @param {Number} days The number of days to include in the message
 */
function sendUserNotification(guildMember, channel, days) {
    let notificationMessage = `${guildMember} - you have not posted proof in ${channel} in the last ${days} days. Users who have not posted in the last 3 days risk being removed from the channel.\nIf you are going to be away for an extended period of time, then please contact a member of the CreatorHub Staff.`;
    if (days === 4 || days === 5) {
        notificationMessage += `\nPlease use the \`/ccvideos\` command in ${channel} and watch all the videos in the response.`;
    }
    guildMember.send(notificationMessage)
        .catch(err => {
            console.error(`${path.basename(__filename)} There was a problem DMing the guild member: `, err);
            channel.send(notificationMessage)
                .catch(err => console.error(`${path.basename(__filename)} There was a problem sending a channel message: `, err));
        });
}

/**
 * @param {GuildMember} guildMember A Discord Member we are notifying about
 * @param {TextChannel} staffChannel The Discord Channel for staff
 * @param {TextChannel} mcChannel The Discord Channel for mods choice
 * @param {Number} days The number of days to include in the message
 */
function sendStaffNotification(guildMember, staffChannel, mcChannel, days) {
    let notificationMessage = `${guildMember} has not posted proof in ${mcChannel} in the last ${days} days.`;
    staffChannel.send(notificationMessage)
        .catch(err => {
            console.error(`${path.basename(__filename)} There was a problem sending a staff notification: `, err);
        });
}

/**
 * @param {Client} client
 */
async function checkPreviousModsChoiceMessages(client) {
    console.log("Checking previously posted messages in Creator Crew.");
    let startTime = new Date();
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const mcChannel = guild.channels.cache.get(process.env.MCHOICE_CHAN);
    let allVideoMessageIds = await mcData.getAllVideoMessageIds();
    let timestampMap = new Map();

    await mcChannel.messages.fetch({limit: 100}).then(messages => {
        messages.forEach(async message => {
            let content = message.content;
            let author = message.author;
            let authorId = author.id;
            let messageId = message.id;
            let timestamp = message.createdAt;

            // Check if the message ID matches any of the video IDs in the DB - if it does, then we can ignore this message
            if (!allVideoMessageIds.includes(messageId)) {
                let videoIdArray = getYoutubeVideoId(content);
                if (videoIdArray != null) {
                    let youtubeVideoId = videoIdArray[1];
                    await mcData.addVideo(authorId, messageId, timestamp.valueOf(), youtubeVideoId);
                }
                if (message.attachments.size > 0 && message.attachments.every(attachmentIsImage)) {
                    // Check if this timestamp is before or after the latest proof in the database
                    let latestProofTs = await mcData.getLatestProofTs(authorId);
                    if (!latestProofTs) {
                        latestProofTs = timestampMap.get(authorId);
                    }
                    if (!latestProofTs || timestamp.valueOf() > latestProofTs) {
                        console.log(`The latest proof from ${authorId} was posted at ${latestProofTs}. Updating it to ${timestamp.valueOf()}`);
                        timestampMap.set(authorId, timestamp.valueOf());
                        await mcData.setLatestProof(authorId, messageId, timestamp.valueOf());
                    }
                }
            }
        });
    }).catch(err => console.error(`${path.basename(__filename)} Failed to find previous messages in Creator Crew: `, err));

    console.log(`Processed previous messages in Creator Crew in ${(new Date - startTime).valueOf()}ms.`)
}

/**
 * @param {Client} client The Discord client
 * @param {Guild} guild A Discord guild
 * @param {TextChannel} staffChannel The Discord Channel for staff
 * @param {TextChannel} mcChannel The Discord Channel for mods choice
 * @param {Number} days The number of days to include in the message
 */
async function warnUsers(client, guild, mcChannel, staffChannel, days) {
    let timespan;
    let notifyStaff = false;
    let warnUser = false;
    let proofVariable;
    switch (days) {
        case 3:
            timespan = threeDays;
            proofVariable = "threeDays";
            notifyStaff = true;
            break;
        case 4:
            timespan = fourDays;
            proofVariable = "fourDays";
            warnUser = true;
            break;
        case 5:
            timespan = fiveDays;
            proofVariable = "fiveDays";
            notifyStaff = true;
            warnUser = true;
            break;
        default:
            console.error(`${path.basename(__filename)} Did not recognise the action to take for ${days} days missed.`);
            return;
    }

    let beforeDate = new Date(new Date().valueOf() - timespan);
    let proofArray = await mcData.getProofBeforeDate(beforeDate.valueOf());
    let usersToWarn = proofArray.filter(proof => !proof[proofVariable] && !proof.away).map(proof => proof.author);
    await usersToWarn.forEach(user => {
        let guildMember = guild.members.cache.get(user);
        if (guildMember) {
            sendUserNotification(guildMember, mcChannel, days);
            if (notifyStaff) {
                sendStaffNotification(guildMember, staffChannel, mcChannel, days);
            }
            if (warnUser) {
                const botId = client.user.id;
                addWarning(user, uuidv4(), botId, ModsChoiceWarningType.HAS_NOT_POSTED_PROOF.value, null);
            }
        }
        mcData.setWarningLevel(user, days);
    });
}

/**
 * @param {Client} client
 */
async function setupModsChoiceChecks(client) {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    setInterval(async () => {
        const mcChannel = guild.channels.cache.get(process.env.MCHOICE_CHAN);
        const staffChannel = guild.channels.cache.get(process.env.STAFF_CHAN);
        const mcRole = guild.roles.cache.get(process.env.MCHOICE_ROLE);
        const staffRole = guild.roles.cache.get(process.env.STAFF_ROLE);
        const modsRole = guild.roles.cache.get(process.env.MOD_ROLE);

        // Remove videos older than 1 month - we assume 1 month is an even 31 days
        let oneMonthAgo = new Date(new Date().valueOf() - oneMonth);
        let messageIds = await mcData.deleteVideosBefore(oneMonthAgo.valueOf());
        await deleteMessages(messageIds, mcChannel);

        // Clean videos from non-mods-choice members
        let allowedMembers = mcRole.members.map(m => m.id)
            .concat(staffRole.members.map(m => m.id))
            .concat(modsRole.members.map(m => m.id))
            .filter((value, index, array) => array.indexOf(value) === index);
        messageIds = await mcData.deleteVideosFromNonChannelMembers(allowedMembers);
        await deleteMessages(messageIds, mcChannel);

        // Clean up proof from non-members
        await mcData.deleteProofFromNonChannelMembers(allowedMembers);

        // Check if anyone hasn't posted a picture in 3 days
        await warnUsers(client, guild, mcChannel, staffChannel, 3);

        // Check if anyone hasn't posted a picture in 4 days
        await warnUsers(client, guild, mcChannel, staffChannel, 4);

        // Check if anyone hasn't posted a picture in 5 days
        await warnUsers(client, guild, mcChannel, staffChannel, 5);

        // Get members with no proof, but who do have a video posted
        let allProofAuthors = await mcData.getProofAuthors();
        let videosWithoutProof = await mcData.getVideosNotFromUsers(allProofAuthors);
        let users = new Set();
        let threeDaysAgo = new Date(new Date().valueOf() - threeDays);
        videosWithoutProof.forEach(video => {
            if (threeDaysAgo.valueOf() > video.videoTs) {
                users.add(video.author);
            }
        });

        [...users].forEach(user => {
            // For each user, we notify them and set a "fake" proof (which is just the message in the staff channel)
            let guildMember = guild.members.cache.get(user);
            sendUserNotification(guildMember, mcChannel, 3);
            staffChannel.send(`${guildMember} has never posted proof in ${mcChannel}, and has videos older than 3 days.`)
                .then(message => {
                    let messageId = message.id;
                    let timestamp = message.createdAt;
                    mcData.setFakeProof(user, messageId, timestamp.valueOf());
                })
                .catch(err => {
                    console.error(`${path.basename(__filename)} There was a problem sending a staff notification: `, err);
                });
        });
    }, interval);
}

module.exports = {
    checkPreviousModsChoiceMessages,
    setupModsChoiceChecks
};
