const { Message } = require('discord.js');
const { msToHumanTime, getLatestVideoTs, addVideo, isAway, getYoutubeVideoId, notifyUser } = require('./utilities');
const ccVideoQueue = require('../../schemas/creator_crew/video_queue');
const path = require('path');

/**
 * 
 * @param {Message} message 
 */
module.exports = async (message, client) => {
    if (message.channel.id === process.env.CCREW_CHAN && !message.author.bot) {
        let author = message.author;
        let authorId = author.id;
        let content = message.content;
        let messageId = message.id;
        let timestamp = message.createdAt;
        let videoIdArray = getYoutubeVideoId(content);

        let hasVideo = videoIdArray != null;
        let hasAttachment = message.attachments.size > 0;
        let isStaffPost = message.member?.roles.cache.some(role => role.id === process.env.STAFF_ROLE);
        let isValidPost = hasVideo || hasAttachment || isStaffPost;

        // Delay of 24 hours between posting videos
        const delayBetweenVideos = 24 * 60 * 60 * 1000;

        const guild = client.guilds.cache.get(process.env.GUILD_ID);

        if (isValidPost) {
            if (hasVideo) {
                // Check if the user is allowed to post (i.e. 24 hours is up and they're not away)
                let latestVideoTs = await getLatestVideoTs(authorId);
                let away = await isAway(authorId);
                if (away) {
                    let notificationMessage = `${author} - you are currently set to away. Please contact a member of the CreatorHub Staff to let them know that you are back before posting a video.`;
                    notifyUser(author, notificationMessage, null);
                    message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                } else if (!latestVideoTs || Math.abs(new Date().valueOf() - latestVideoTs) >= delayBetweenVideos) {
                    // The video ID is stored in capture group 1, while the whole link is capture group 0
                    let youtubeVideoId = videoIdArray[1];
                    const ccUsers = guild.roles.cache.get(process.env.CCREW_ROLE);
                    ccUsers.members.forEach(async member => {
                        // Check if the video is already in the user's queue
                        const isAlreadyInQueue = (await ccVideoQueue.find({ userId: member.user.id, videoId: youtubeVideoId })).length;
                        if (isAlreadyInQueue < 1) {
                            await ccVideoQueue.create({
                                userId: member.user.id,
                                videoId: youtubeVideoId,
                                timestamp: timestamp.valueOf()
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem creating a database entry: `, err));
                        }
                    });
                    await addVideo(authorId, messageId, timestamp.valueOf(), youtubeVideoId, guild);
                } else {
                    let waitUntil = new Date(latestVideoTs + delayBetweenVideos);
                    let timeRemaining = (waitUntil - new Date()).valueOf();
                    let notificationMessage = `${author} - you must wait ${msToHumanTime(timeRemaining)} before posting another video to ${message.channel}.`;
                    notifyUser(author, notificationMessage, message.channel);
                    message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                    return;
                }
            }
        } else {
            // This was not a valid post in the channel, so we delete it
            message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        }
    }
}