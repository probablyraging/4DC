const mongo = require("../../mongo");
const blacklistSchema = require('../../schemas/database_logs/blacklist_schema');

async function logToDatabase(userId, username, channel, reason, message, timestamp, type) {
    await mongo().then(async mongoose => {
        await blacklistSchema.create({
            userId: userId,
            username: username,
            channel: channel,
            reason: reason,
            message: message,
            timestamp: timestamp,
            type: type
        });
    });
}

module.exports = {
    logToDatabase,
};