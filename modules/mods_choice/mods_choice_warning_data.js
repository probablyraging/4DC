const mongo = require('../../mongo');
const path = require("path");
const mcWarnModel = require('../../schemas/mods_choice/mods_choice_warn_schema');

/**
 * @param {String} userId The Discord User.id of the person being warned
 * @param {String} warnId The ID of the warning to add
 * @param {String} warnedBy The Discord User.id of the admin who warned the user
 * @param {String} reason The reason for the warning
 * @param {String | null} messageUrl A URL of a Discord message to support the warning, or null
 */
async function addWarning(userId, warnId, warnedBy, reason, messageUrl) {
    await mongo().then(async () => {
        let timestamp = new Date().valueOf();
        const newWarning = new mcWarnModel({userId: userId, warnId: warnId, warnedBy: warnedBy, timestamp: timestamp, reason: reason, messageUrl: messageUrl});
        await newWarning.save().catch(err => console.error(`${path.basename(__filename)} There was a problem saving the warning ${warnId} for user ${userId}: `, err));
    });
}

/**
 * @param {String | null} userId Fetch all warnings for the given Discord User.id, or all warning if no user ID
 * @return {mcWarnModel[]} An array of warnings
 */
async function getWarnings(userId) {
    return await mongo().then(async () => {
        // If we have a userId, find the warnings for the user - else find all warnings
        let query = userId ? mcWarnModel.find({userId: userId}) : mcWarnModel.find();
        let results = await query.sort('timestamp').exec()
            .catch(err => console.error(`${path.basename(__filename)} There was a problem fetching all mods choice warnings: `, err));
        if (!results || results.length === 0) {
            return [];
        } else {
            return results;
        }
    });
}

/**
 * @param {String} warnId The warning ID to delete
 */
async function deleteWarning(warnId) {
    await mongo().then(async () => {
        mcWarnModel.deleteOne({warnId: warnId}).exec()
            .catch(err => console.error(`${path.basename(__filename)} There was a problem deleting videos from non-mods-choice members: `, err));
    });
}

module.exports = {
    addWarning,
    getWarnings,
    deleteWarning
};
