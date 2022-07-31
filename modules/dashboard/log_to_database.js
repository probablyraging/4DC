const blacklistSchema = require('../../schemas/database_logs/blacklist_schema');
const chartData = require('../../schemas/database_logs/chart_data');
const path = require('path');

// Database log
async function logToDatabase(userId, username, channel, reason, message, timestamp, type) {
    await blacklistSchema.create({
        userId: userId,
        username: username,
        channel: channel,
        reason: reason,
        message: message,
        timestamp: timestamp,
        type: type
    });
}

// Chart data
let newCommsArr = [];
async function logToChartData(logType, author) {
    const nowTimestamp = new Date().valueOf();
    const tsToDate = new Date(nowTimestamp);
    const months = ["Jan", "Fab", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dateToUTC = tsToDate.getUTCDate() + ' ' + months[tsToDate.getUTCMonth()] + ' ' + tsToDate.getUTCFullYear();

    const results = await chartData.find({ date: dateToUTC });

    if (logType === 'joins') {
        if (results.length === 0) {
            await chartData.create({
                date: dateToUTC,
                joins: '1',
                leaves: '0',
                bans: '0',
                messages: '0',
                timeouts: '0',
                warnings: '0',
                newcommunicators: '0'
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem creating a database entry: `, err));
        } else {
            for (const data of results) {
                const { joins } = data;
                current = joins;
                current++;
                await chartData.updateOne({
                    date: dateToUTC
                }, {
                    joins: current.toString()
                }, {
                    upsert: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
            }
        }
    }

    if (logType === 'leaves') {
        if (results.length === 0) {
            await chartData.create({
                date: dateToUTC,
                joins: '0',
                leaves: '1',
                bans: '0',
                messages: '0',
                timeouts: '0',
                warnings: '0',
                newcommunicators: '0'
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem creating a database entry: `, err));
        } else {
            for (const data of results) {
                const { leaves } = data;
                current = leaves;
                current++;
                await chartData.updateOne({
                    date: dateToUTC
                }, {
                    leaves: current.toString()
                }, {
                    upsert: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
            }
        }
    }

    if (logType === 'bans') {
        if (results.length === 0) {
            await chartData.create({
                date: dateToUTC,
                joins: '0',
                leaves: '0',
                bans: '1',
                messages: '0',
                timeouts: '0',
                warnings: '0',
                newcommunicators: '0'
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem creating a database entry: `, err));
        } else {
            for (const data of results) {
                const { bans } = data;
                current = bans;
                current++;
                await chartData.updateOne({
                    date: dateToUTC
                }, {
                    bans: current.toString()
                }, {
                    upsert: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
            }
        }
    }

    if (logType === 'messages') {
        // First check to see if the message author is a new communicator
        for (const data of results) {
            const { newcommunicatorsarr } = data;
            if (!newcommunicatorsarr.includes(author)) {
                newCommsArr.push(author);
                logToChartData('newcommunicators');
            }
        }

        if (results.length === 0) {
            await chartData.create({
                date: dateToUTC,
                joins: '0',
                leaves: '0',
                bans: '0',
                messages: '1',
                timeouts: '0',
                warnings: '0',
                newcommunicators: '0'
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem creating a database entry: `, err));
        } else {
            for (const data of results) {
                const { messages } = data;
                current = messages;
                current++;
                await chartData.updateOne({
                    date: dateToUTC
                }, {
                    messages: current.toString()
                }, {
                    upsert: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
            }
        }
    }

    if (logType === 'timeouts') {
        if (results.length === 0) {
            await chartData.create({
                date: dateToUTC,
                joins: '0',
                leaves: '0',
                bans: '0',
                messages: '0',
                timeouts: '1',
                warnings: '0',
                newcommunicators: '0'
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem creating a database entry: `, err));
        } else {
            for (const data of results) {
                const { timeouts } = data;
                current = timeouts;
                current++;
                await chartData.updateOne({
                    date: dateToUTC
                }, {
                    timeouts: current.toString()
                }, {
                    upsert: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
            }
        }
    }

    if (logType === 'warnings') {
        if (results.length === 0) {
            await chartData.create({
                date: dateToUTC,
                joins: '0',
                leaves: '0',
                bans: '0',
                messages: '0',
                timeouts: '0',
                warnings: '1',
                newcommunicators: '0'
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem creating a database entry: `, err));
        } else {
            for (const data of results) {
                const { warnings } = data;
                current = warnings;
                current++;
                await chartData.updateOne({
                    date: dateToUTC
                }, {
                    warnings: current.toString()
                }, {
                    upsert: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
            }
        }
    }

    if (logType === 'newcommunicators') {
        if (results.length === 0) {
            await chartData.create({
                date: dateToUTC,
                joins: '0',
                leaves: '0',
                bans: '0',
                messages: '0',
                timeouts: '0',
                warnings: '0',
                newcommunicators: '1',
                newcommunicatorsarr: newCommsArr
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem creating a database entry: `, err));
        } else {
            for (const data of results) {
                const { newcommunicators } = data;
                current = newcommunicators;
                current++;
                await chartData.updateOne({
                    date: dateToUTC
                }, {
                    newcommunicators: current.toString(),
                    newcommunicatorsarr: newCommsArr
                }, {
                    upsert: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
            }
        }
    }
}

module.exports = {
    logToDatabase,
    logToChartData
};