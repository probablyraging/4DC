const mongo = require('../../mongo');
const path = require("path");
const mcVideoModel = require('../../schemas/mods-choice-video-schema');
const mcProofModel = require('../../schemas/mods-choice-proof-schema');

/**
 * @param {String} authorId The Discord User.id
 * @param {String} messageId The Discord Message.id
 * @param {Number} messageTimestamp The timestamp that the video message was sent
 * @param {String} videoId The YouTube video ID numbers/letters
 */
async function addVideo(authorId, messageId, messageTimestamp, videoId) {
    await mongo().then(async () => {
        const newVideo = new mcVideoModel({author: authorId, videoMessageId: messageId, videoId: videoId, videoTs: messageTimestamp});
        newVideo.save(function (err) {
            if (err) {
                return console.error(`${path.basename(__filename)} There was a problem adding video ${videoId} for author ${authorId} from message ${messageId}: `, err);
            }
        });
    });
}

/**
 * @param {String} authorId The Discord User.id
 * @return {Number | null} The timestamp of the last video, or null if there is no timestamp
 */
async function getLatestVideoTs(authorId) {
    return await mongo().then(async () => {
        let result = await mcVideoModel.findOne({author: authorId}, 'videoTs').sort('-videoTs').exec()
            .catch(err => console.error(`${path.basename(__filename)} There was a problem fetching the latest video timestamp from author ${authorId}: `, err));
        if (!result) {
            return null;
        } else {
            return result.videoTs;
        }
    });
}

/**
 * @param {String} authorId The Discord User.id
 * @return {String[]} An array of YouTube URLs containing an entry for each video since the last proof, or all videos if there has been no proof
 */
async function getVideosSinceLastProof(authorId) {
    let lastProofTs = await getLatestProofTs(authorId);
    return getVideosSince(lastProofTs);
}

/**
 * @param {Number} messageTimestamp Fetch all videos posted after this timestamp
 * @return {String[]} An array of YouTube URLs containing an entry for each video since the given timestamp, or all videos if no timestamp
 */
async function getVideosSince(messageTimestamp) {
    return await mongo().then(async () => {
        // If we have a timestamp, find videos greater than that. If not, then find all videos
        let query = messageTimestamp ? mcVideoModel.find({videoTs: {$gt: messageTimestamp}}) : mcVideoModel.find();
        let results = await query.sort('videoTs').exec()
            .catch(err => console.error(`${path.basename(__filename)} There was a problem fetching all videos since ${messageTimestamp}: `, err));
        if (!results || results.length === 0) {
            return [];
        } else {
            let urls = new Set();
            results.forEach(result => urls.add("https://www.youtube.com/watch?v=" + result.videoId));
            return [...urls];
        }
    });
}

/**
 * @return {String[]} An array of Discord Message.ids representing all the posted videos
 */
async function getAllVideoMessageIds() {
    return await mongo().then(async () => {
        let results = await mcVideoModel.find().exec()
            .catch(err => console.error(`${path.basename(__filename)} There was a problem fetching all video message IDs: `, err));
        if (!results || results.length === 0) {
            return [];
        } else {
            let ids = new Set();
            results.forEach(result => ids.add(result.videoMessageId));
            return [...ids];
        }
    });
}

/**
 * @param {String[]} users A list of Discord User.ids of users we don't want to find videos from
 * @return {mcVideoModel[]} An array of Discord Message.ids representing all the posted videos
 */
async function getVideosNotFromUsers(users) {
    return await mongo().then(async () => {
        let results = await mcVideoModel.find({author: {$nin: users}}).exec()
            .catch(err => console.error(`${path.basename(__filename)} There was a problem fetching videos from non-mods-choice members: `, err));
        if (!results || results.length === 0) {
            return [];
        } else {
            return results;
        }
    });
}

/**
 * @param {Number} messageTimestamp Delete all videos posted before this timestamp
 * @return {String[]} An array of Discord Message.ids that were associated with the deleted videos
 */
async function deleteVideosBefore(messageTimestamp) {
    return await mongo().then(async () => {
        let videosToDelete = await mcVideoModel.find({videoTs: {$lt: messageTimestamp}}).exec()
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
            await mcVideoModel.deleteMany({_id: {$in: ids}}).exec()
                .catch(err => console.error(`${path.basename(__filename)} There was a problem deleting videos before ${messageTimestamp}: `, err));
            return messageIds;
        }
    });
}

/**
 * @param {String[]} users A list of Discord User.ids representing the members of the channel
 * @return {String[]} An array of Discord Message.ids that were associated with the deleted videos
 */
async function deleteVideosFromNonChannelMembers(users) {
    return await mongo().then(async () => {
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
            await mcVideoModel.deleteMany({_id: {$in: ids}}).exec()
                .catch(err => console.error(`${path.basename(__filename)} There was a problem deleting videos from non-mods-choice members: `, err));
            return messageIds;
        }
    });
}

/**
 * @param {String[]} users A list of Discord User.ids representing the members of the channel
 */
async function deleteProofFromNonChannelMembers(users) {
    return await mongo().then(async () => {
        await mcProofModel.deleteMany({author: {$nin: users}}).exec()
            .catch(err => console.error(`${path.basename(__filename)} There was a problem deleting proof from non-mods-choice members: `, err));
    });
}

/**
 * @param {String} authorId The Discord User.id
 * @param {String} messageId The Discord Message.id of the proof message
 * @param {Number} messageTimestamp The timestamp that the video message was sent
 */
async function setLatestProof(authorId, messageId, messageTimestamp) {
    return await mongo().then(async () => {
        let result = await mcProofModel.findOne({author: authorId}).exec()
            .catch(err => console.error(`${path.basename(__filename)} There was a problem fetching proof for user ${authorId}: `, err));
        if (!result) {
            const newProof = new mcProofModel({author: authorId, proofId: messageId, proofTs: messageTimestamp});
            newProof.save(function (err) {
                if (err) {
                    return console.error(`${path.basename(__filename)} There was a problem saving proof for the user ${authorId} from message ${messageId}: `, err);
                }
            });
        } else {
            // Set the proof id and timestamp, and reset the notification flags
            result.proofId = messageId;
            result.proofTs = messageTimestamp;
            result.userNotified = false;
            result.staffNotified = false;
            result.save();
        }
    });
}

/**
 * @param {String} authorId The Discord User.id
 * @param {String} messageId The Discord Message.id of the proof message
 * @param {Number} messageTimestamp The timestamp that the video message was sent
 */
async function setFakeProof(authorId, messageId, messageTimestamp) {
    return await mongo().then(async () => {
        const fakeProof = new mcProofModel({author: authorId, proofId: messageId, proofTs: messageTimestamp, userNotified: true, staffNotified: true, missedCount: 1});
        fakeProof.save(function (err) {
            if (err) {
                return console.error(`${path.basename(__filename)} There was a problem saving fake proof for user ${authorId} from message ${messageId}: `, err);
            }
        });
    });
}

/**
 * @param {String} authorId The Discord User.id
 * @return {Number | null} The timestamp of the last proof, or null if there is no timestamp
 */
async function getLatestProofTs(authorId) {
    return await mongo().then(async () => {
        let result = await mcProofModel.findOne({author: authorId}).exec()
            .catch(err => console.error(`${path.basename(__filename)} There was a problem fetching the latest proof timestamp for ${authorId}: `, err));
        if (!result) {
            return null;
        } else {
            return result.proofTs;
        }
    });
}

/**
 * @return {mcProofModel[]} An array of proof model for users who staff have been notified about
 */
async function getWarnedUsersProof() {
    return await mongo().then(async () => {
        let results = await mcProofModel.find({staffNotified: true}).exec()
            .catch(err => console.error(`${path.basename(__filename)} There was a problem fetching the array of proof for all warned users: `, err));
        if (!results) {
            return [];
        } else {
            return results;
        }
    });
}

/**
 * @return {String[]} All Discord User.ids of people who have submitted proof
 */
async function getProofAuthors() {
    return await mongo().then(async () => {
        let results = await mcProofModel.find().exec()
            .catch(err => console.error(`${path.basename(__filename)} There was a problem fetching all proof from the database: `, err));
        if (!results || results.length === 0) {
            return [];
        } else {
            let authors = new Set();
            results.forEach(result => {
                authors.add(result.author);
            });
            return [...authors];
        }
    });
}

/**
 * @param {Number} timestamp The timestamp
 * @return {mcProofModel[]} The proof models of users who have not posted proof since the timestamp
 */
async function getProofBeforeDate(timestamp) {
    return await mongo().then(async () => {
        let results = await mcProofModel.find({proofTs: {$lt: timestamp}}).exec()
            .catch(err => console.error(`${path.basename(__filename)} There was a problem fetching all proof before ${timestamp}: `, err));
        if (!results) {
            return [];
        } else {
            return results;
        }
    });
}

/**
 * @param {String} authorId The Discord User.id
 */
async function setUserNotified(authorId) {
    return await mongo().then(async () => {
        let result = await mcProofModel.findOne({author: authorId}).exec()
            .catch(err => console.error(`${path.basename(__filename)} There was a problem finding proof for the user ${authorId}: `, err));
        if (!result) {
            console.error(`Tried to set a warning on user ${authorId}, but could not find proof in the database.`);
        } else {
            // Set the proof link and timestamp, and reset the notification flags
            result.userNotified = true;
            result.save();
        }
    });
}

/**
 * @param {String} authorId The Discord User.id
 */
async function setStaffNotified(authorId) {
    return await mongo().then(async () => {
        let result = await mcProofModel.findOne({author: authorId}).exec()
            .catch(err => console.error(`${path.basename(__filename)} There was a problem finding proof for the user ${authorId}: `, err));
        if (!result) {
            console.error(`Tried to set staff notified on user ${authorId}, but could not find proof in the database.`);
        } else {
            // Set the proof link and timestamp, and reset the notification flags
            result.staffNotified = true;
            result.missedCount = (result.missedCount + 1);
            result.save();
        }
    });
}

module.exports = {
    addVideo,
    deleteVideosBefore,
    deleteVideosFromNonChannelMembers,
    deleteProofFromNonChannelMembers,
    getVideosSinceLastProof,
    getVideosSince,
    getVideosNotFromUsers,
    getAllVideoMessageIds,
    getLatestVideoTs,
    getLatestProofTs,
    getProofBeforeDate,
    getProofAuthors,
    getWarnedUsersProof,
    setLatestProof,
    setFakeProof,
    setUserNotified,
    setStaffNotified
};
