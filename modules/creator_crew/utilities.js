const ccVideoModel = require('../../schemas/creator_crew/video_schema');
const ccProofModel = require('../../schemas/creator_crew/proof_schema');
const ccWarnModel = require('../../schemas/creator_crew/warn_schema');
const path = require('path');

function msToHumanTime(milliseconds) {
    let hours = milliseconds / (1000 * 60 * 60);
    let hoursFloor = Math.floor(hours);

    let minutes = (hours - hoursFloor) * 60;
    let minutesFloor = Math.floor(minutes);

    let seconds = (minutes - minutesFloor) * 60;
    let secondFloor = Math.floor(seconds);

    return hoursFloor + " hours, " + minutesFloor + " minutes and " + secondFloor + " seconds";
}

function timeElapsedBetweenTimestamps(nowTime, oldTime) {
    const msDifference = nowTime - oldTime;
    const daysDifference = msDifference / 1000 / 60 / 60 / 24;
    return daysDifference;
}

async function getLatestVideoTs(authorId) {
    let result = await ccVideoModel.findOne({ author: authorId }, 'videoTs').sort('-videoTs').exec()
        .catch(err => console.error(`${path.basename(__filename)} There was a problem fetching the latest video timestamp from author ${authorId}: `, err));
    if (!result) {
        return null;
    } else {
        return result.videoTs;
    }
}

async function addVideo(authorId, messageId, messageTimestamp, videoId, guild) {
    const newVideo = new ccVideoModel({ author: authorId, videoMessageId: messageId, videoId: videoId, videoTs: messageTimestamp });
    newVideo.save(function (err) {
        if (err) {
            return console.error(`${path.basename(__filename)} There was a problem adding video ${videoId} for author ${authorId} from message ${messageId}: `, err);
        }
    });
}

async function isAway(userId) {
    let result = await ccProofModel.findOne({ author: userId }).exec()
        .catch(err => console.error(`${path.basename(__filename)} There was a problem fetching away users from the database: `, err));
    return result ? result.away : false;
}

function getYoutubeVideoId(string) {
    // Match http/https and youtu.be/youtube.com URLs, along with youtube.com/shorts/
    let regExp = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/|be\.com\/shorts\/)([\w\-_]*)(&(amp;)[\w=]*)?/;
    // The execution of this regex returns the first YouTube video ID, or null
    return regExp.exec(string);
}

function notifyUser(member, message, backupChannel) {
    member.send(message)
        .catch(err => {
            console.error(`${path.basename(__filename)} There was a problem DMing the guild member: `, err);
            if (backupChannel) {
                backupChannel.send(message)
                    .catch(err => console.error(`${path.basename(__filename)} There was a problem sending a channel message: `, err));
            }
        });
}

async function getAllVideoMessageIds() {
    let results = await ccVideoModel.find().exec()
        .catch(err => console.error(`${path.basename(__filename)} There was a problem fetching all video message IDs: `, err));
    if (!results || results.length === 0) {
        return [];
    } else {
        let ids = new Set();
        results.forEach(result => ids.add(result.videoMessageId));
        return [...ids];
    }
}

async function deleteVideosFromNonChannelMembers(users) {
    let videosToDelete = await getVideosNotFromUsers(users);
    if (!videosToDelete || videosToDelete.length === 0) {
        return [];
    } else {
        let messageIds = [];
        let ids = [];
        videosToDelete.forEach(video => {
            messageIds.push(video.videoMessageId);
            ids.push(video._id);
        });
        await ccVideoModel.deleteMany({ _id: { $in: ids } }).exec()
            .catch(err => console.error(`${path.basename(__filename)} There was a problem deleting videos from non-Creator Crew members: `, err));
        return messageIds;
    }
}

async function deleteVideosBefore(messageTimestamp) {
    let videosToDelete = await ccVideoModel.find({ videoTs: { $lt: messageTimestamp } }).exec()
        .catch(err => console.error(`${path.basename(__filename)} There was a problem fetching videos from before ${messageTimestamp}: `, err));
    if (!videosToDelete || videosToDelete.length === 0) {
        return [];
    } else {
        let messageIds = [];
        let ids = [];
        videosToDelete.forEach(video => {
            messageIds.push(video.videoMessageId);
            ids.push(video._id);
        });
        await ccVideoModel.deleteMany({ _id: { $in: ids } }).exec()
            .catch(err => console.error(`${path.basename(__filename)} There was a problem deleting videos before ${messageTimestamp}: `, err));
        return messageIds;
    }
}

async function getVideosNotFromUsers(users) {
    let results = await ccVideoModel.find({ author: { $nin: users } }).exec()
        .catch(err => console.error(`${path.basename(__filename)} There was a problem fetching videos from non-Creator Crew members: `, err));
    if (!results || results.length === 0) {
        return [];
    } else {
        return results;
    }
}

function attachmentIsImage(attachment) {
    let url = attachment.url.toLowerCase();
    return url.endsWith("png") || url.endsWith("jpg") || url.endsWith("gif");
}

async function toggleAway(authorId) {
    let result = await ccProofModel.findOne({ author: authorId }).exec()
        .catch(err => console.error(`${path.basename(__filename)} There was a problem finding proof for the user ${authorId}: `, err));
    if (!result) {
        console.error(`Tried to set the user ${authorId} as away, but could not find proof in the database.`);
        return null;
    } else {
        if (result.away) {
            // When the user comes back from being away, set the latest proof time as now, so they don't get warnings for when they were away
            result.proofTs = new Date().valueOf();
            result.away = false;
        } else {
            result.away = true;
        }
        result.save();
        return result.away;
    }
}

async function getAwayUsers() {
    let results = await ccProofModel.find({ away: true }).exec()
        .catch(err => console.error(`${path.basename(__filename)} There was a problem fetching away users from the database: `, err));
    if (!results || results.length === 0) {
        return [];
    } else {
        let authors = new Set();
        results.forEach(result => {
            authors.add(result.author);
        });
        return [...authors];
    }
}

async function getWarnings(userId) {
    // If we have a userId, find the warnings for the user - else find all warnings
    let query = userId ? ccWarnModel.find({ userId: userId }) : ccWarnModel.find();
    let results = await query.sort('timestamp').exec()
        .catch(err => console.error(`${path.basename(__filename)} There was a problem fetching all Creator Crew warnings: `, err));
    if (!results || results.length === 0) {
        return [];
    } else {
        return results;
    }
}

async function deleteWarning(warnId) {
    ccWarnModel.deleteOne({ warnId: warnId }).exec()
        .catch(err => console.error(`${path.basename(__filename)} There was a problem deleting videos from non-Creator Crew members: `, err));
}

module.exports = {
    msToHumanTime,
    timeElapsedBetweenTimestamps,
    getLatestVideoTs,
    addVideo,
    isAway,
    getYoutubeVideoId,
    notifyUser,
    getAllVideoMessageIds,
    deleteVideosFromNonChannelMembers,
    deleteVideosBefore,
    getVideosNotFromUsers,
    attachmentIsImage,
    toggleAway,
    getAwayUsers,
    getWarnings,
    deleteWarning
}