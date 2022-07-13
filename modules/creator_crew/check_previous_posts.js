require("dotenv").config();
const { getYoutubeVideoId, getAllVideoMessageIds, convertTimestampToRelativeTime, isAway, deleteVideosFromNonChannelMembers, addVideo, deleteVideosBefore } = require('./utilities');
const ccVideoQueue = require('../../schemas/creator_crew/video_queue');
const ccProofModel = require('../../schemas/creator_crew/proof_schema');
const path = require("path");

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

async function checkPreviousPosts(client) {
    console.log("Checking previously posted messages in Creator Crew.");
    let startTime = new Date();
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const ccChannel = guild.channels.cache.get(process.env.CCREW_CHAN);
    let allVideoMessageIds = await getAllVideoMessageIds();
    let timestampMap = new Map();

    await ccChannel.messages.fetch({ limit: 100 }).then(messages => {
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
                    await addVideo(authorId, messageId, timestamp.valueOf(), youtubeVideoId);
                }
            }
        });
    }).catch(err => console.error(`${path.basename(__filename)} Failed to find previous messages in Creator Crew: `, err));

    console.log(`Processed previous messages in Creator Crew in ${(new Date - startTime).valueOf()}ms.`)
}

async function setupChecks(client) {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    setInterval(async () => {
        const ccChannel = guild.channels.cache.get(process.env.CCREW_CHAN);
        const ccRole = guild.roles.cache.get(process.env.CCREW_ROLE);
        const staffRole = guild.roles.cache.get(process.env.STAFF_ROLE);
        const modsRole = guild.roles.cache.get(process.env.MOD_ROLE);

        const oneMonth = 31 * 24 * 60 * 60 * 1000;

        // Remove videos older than 1 month - we assume 1 month is an even 31 days
        let oneMonthAgo = new Date(new Date().valueOf() - oneMonth);
        let messageIds = await deleteVideosBefore(oneMonthAgo.valueOf());
        await deleteMessages(messageIds, ccChannel);

        // Clean videos from non-mods-choice members
        let allowedMembers = ccRole.members.map(m => m.id)
            .concat(staffRole.members.map(m => m.id))
            .concat(modsRole.members.map(m => m.id))
            .filter((value, index, array) => array.indexOf(value) === index);
        messageIds = await deleteVideosFromNonChannelMembers(allowedMembers);
        await deleteMessages(messageIds, ccChannel);

        const staffChan = guild.channels.cache.get(process.env.TEST_CHAN);
        const getUsersVideoQueue = await ccVideoQueue.find();

        let lateUsersThree = [];
        let lateUsersFive = [];

        for (const data of getUsersVideoQueue) {
            const { userId, videoAuthor, videoId, timestamp, notified3, notified5 } = data;
            const ccMember = guild.members.cache.get(userId);
            const away = await isAway(userId);

            // Check if member is no longer in Creator Crew and remove their proof entry and queue
            const checkUserRoles = await guild.members.cache.get(userId)?._roles;
            if (!checkUserRoles.includes(process.env.CCREW_ROLE)) {
                await ccVideoQueue.findOneAndRemove({
                    userId: userId,
                    videoId: videoId
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a database entry: `, err));
            }
            // Also remove their videos from other members queues
            const checkAuthorRoles = await guild.members.cache.get(videoAuthor)?._roles;
            if (videoAuthor && !checkAuthorRoles.includes(process.env.CCREW_ROLE)) {
                await ccVideoQueue.findOneAndRemove({
                    videoAuthor: videoAuthor
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a database entry: `, err));
            }

            // Check all video timestamps in all Creator Crew members queues - notify users/staff if videos haven't been watched
            if (!away && !notified3 && convertTimestampToRelativeTime(timestamp) === 3) {
                lateUsersThree.push(userId);
                // Notify member
                ccMember.send({
                    content: `A video with the ID \`${videoId}\` has been in your Creator Crew Queue for greater than 3 days. You must watch all videos before 3 days. Continuing to miss this 3 day requirement may result in you being removed from the Creator Crew role`
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem DMing the guild member: `, err));
                // Mark this video as notified so we don't notify again
                await ccVideoQueue.findOneAndUpdate({
                    userId: userId,
                    videoId: videoId
                }, {
                    notified3: true
                }, {
                    upsert: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
            }
            if (!away && !notified5 && convertTimestampToRelativeTime(timestamp) === 5) {
                lateUsersFive.push(userId);
                // Notify the member
                ccMember.send({
                    content: `A video with the ID \`${videoId}\` has been in your Creator Crew Queue for greater than 5 days. Staff have been notified and you may be removed from the Creator Crew role`
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem DMing the guild member: `, err));
                // Mark this video as notified so we don't notify again
                await ccVideoQueue.findOneAndUpdate({
                    userId: userId,
                    videoId: videoId
                }, {
                    notified5: true
                }, {
                    upsert: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
            }
        }
        // Notify staff - 3 days
        if (lateUsersThree.length > 1) {
            // Notify staff
            const notifyMessage = `<@${lateUsersThree.join('>, <@')}> have not watched a video in their queue for greater than 3 days`;
            staffChan.send({
                content: `<@438434841617367080>
${notifyMessage}`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
        } else if (lateUsersThree === 1) {
            // Notify staff
            const notifyMessage = `<@${lateUsersThree.join('>, <@')}> have not watched a video in their queue for greater than 3 days`;
            staffChan.send({
                content: `<@438434841617367080>
${notifyMessage}`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
        }
        // Notify staff - 5 days
        if (lateUsersFive.length > 1) {
            // Notify staff
            const notifyMessage = `<@${lateUsersFive.join('>, <@')}> have not watched a video in their queue for greater than 5 days`;
            staffChan.send({
                content: `<@438434841617367080>
${notifyMessage}`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
        } else if (lateUsersFive === 1) {
            // Notify staff
            const notifyMessage = `<@${lateUsersFive.join('>, <@')}> have not watched a video in their queue for greater than 5 days`;
            staffChan.send({
                content: `<@438434841617367080>
${notifyMessage}`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
        }

        // Check if a new user has been added to the role, if so create a proof entry in the database for them
        ccRole.members.forEach(async member => {
            const results = await ccProofModel.find({ author: member?.user.id });
            if (results.length === 0) {
                await ccProofModel.create({
                    author: member?.user.id,
                    proofTs: 0,
                    proofId: 'null',
                    threeDays: false,
                    fourDays: false,
                    fiveDays: false,
                    away: false,
                    missedCount: 0
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem creating a database entry: `, err));
                console.log(`Created a Creator Crew proof entry for ${member?.user.id}`);
            }
        });
    }, 15 * 60 * 1000);
}

module.exports = {
    checkPreviousPosts,
    setupChecks
};