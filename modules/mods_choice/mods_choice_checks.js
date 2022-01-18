require("dotenv").config();
const path = require("path");
const mcData = require("./mods_choice_data");
const {getYoutubeVideoId, attachmentIsImage} = require("./mods_choice_utils");

// Time constants
const interval = 15 * 60 * 1000;
const twoDays = 2 * 24 * 60 * 60 * 1000;
const threeDays = 3 * 24 * 60 * 60 * 1000;
const oneMonth = 31 * 24 * 60 * 60 * 1000;

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
 * @param {String} timeString The time string to include in the notification message
 */
function sendUserNotification(guildMember, channel, timeString) {
    let notificationMessage = `${guildMember} - you have not posted proof in ${channel} in the last ${timeString}. Users who have not posted in the last 3 days risk being removed from the channel.`;
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
 */
function sendStaffNotification(guildMember, staffChannel, mcChannel) {
    let notificationMessage = `${guildMember} has not posted proof in ${mcChannel} in the last 3 days.`;
    staffChannel.send(notificationMessage)
        .catch(err => {
            console.error(`${path.basename(__filename)} There was a problem sending a staff notification: `, err);
        });
}

/**
 * @param {Client} client
 */
async function checkPreviousModsChoiceMessages(client) {
    console.log("Checking previously posted messages in mods choice.");
    let startTime = new Date();
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const mcChannel = guild.channels.cache.get(process.env.MCHOICE_CHAN);
    let allVideoMessageIds = await mcData.getAllVideoMessageIds();

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
                } else if (message.attachments.size > 0 && message.attachments.every(attachmentIsImage)) {
                    // Check if this timestamp is before or after the latest proof in the database
                    let latestProofTs = await mcData.getLatestProofTs(authorId);
                    if (!latestProofTs || timestamp > latestProofTs) {
                        await mcData.setLatestProof(authorId, messageId, timestamp.valueOf());
                    }
                }
            }
        });
    }).catch(err => console.error(`${path.basename(__filename)} Failed to find previous messages in mods-choice: `, err));

    console.log(`Processed previous messages in mods choice in ${(new Date - startTime).valueOf()}ms.`)
}

/**
 * @param {Client} client
 */
async function setupModsChoiceChecks(client) {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    setInterval(async () => {
        const mcChannel = guild.channels.cache.get(process.env.MCHOICE_CHAN);
        const staffChannel = guild.channels.cache.get(process.env.STAFF_CHAT);
        const mcRole = guild.roles.cache.get(process.env.MCHOICE_ROLE);

        // Remove videos older than 1 month - we assume 1 month is an even 31 days
        let oneMonthAgo = new Date(new Date().valueOf() - oneMonth);
        let messageIds = await mcData.deleteVideosBefore(oneMonthAgo.valueOf());
        await deleteMessages(messageIds, mcChannel);

        // Clean videos from non-mods-choice members
        let membersWithRole = mcRole.members.map(m => m.id);
        messageIds = await mcData.deleteVideosFromNonChannelMembers(membersWithRole);
        await deleteMessages(messageIds, mcChannel);

        // Clean up proof from non-members
        await mcData.deleteProofFromNonChannelMembers(membersWithRole);

        // Check if anyone hasn't posted a picture in 2 days, and hasn't been warned
        let twoDaysAgo = new Date(new Date().valueOf() - twoDays);
        let proofArray = await mcData.getProofBeforeDate(twoDaysAgo.valueOf());
        let usersToWarn = proofArray.filter(proof => !proof.userNotified).map(proof => proof.author);
        await usersToWarn.forEach(user => {
            let guildMember = guild.members.cache.get(user);
            if (guildMember) {
                sendUserNotification(guildMember, mcChannel, "2 days");
            }
            mcData.setUserNotified(user);
        });

        // Check if anyone hasn't posted a picture in 3 days, and staff haven't been notified
        let threeDaysAgo = new Date(new Date().valueOf() - threeDays);
        proofArray = await mcData.getProofBeforeDate(threeDaysAgo.valueOf());
        usersToWarn = proofArray.filter(proof => !proof.staffNotified).map(proof => proof.author);
        await usersToWarn.forEach(user => {
            let guildMember = guild.members.cache.get(user);
            if (guildMember) {
                sendUserNotification(guildMember, mcChannel, "3 days");
                sendStaffNotification(guildMember, staffChannel, mcChannel);
            }
            mcData.setStaffNotified(user);
        });

        // Get members with no proof, but who do have a video posted
        let allProofAuthors = await mcData.getProofAuthors();
        let videosWithoutProof = await mcData.getVideosNotFromUsers(allProofAuthors);
        let users = new Set();
        videosWithoutProof.forEach(video => {
            if (threeDaysAgo.valueOf() > video.videoTs) {
                users.add(video.author);
            }
        });

        [...users].forEach(user => {
            // For each user, we notify them and set a "fake" proof (which is just the message in the staff channel)
            let guildMember = guild.members.cache.get(user);
            sendUserNotification(guildMember, mcChannel, "3 days");
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
