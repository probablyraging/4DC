const { dbUpdateOne } = require('../../utils/utils');
const timerSchema = require("../../schemas/misc/timer_schema");
const axios = require('axios');
const path = require('path');

module.exports = async (message, client, Discord) => {
    setInterval(async () => {
        const results = await timerSchema.findOne({ timer: 'dms' });
        if (!results) return;
        const { timestamp } = results;
        if (Date.now() > timestamp) {
            const currentDate = new Date();
            currentDate.setHours(currentDate.getHours() + 24);
            const isoTimestamp = currentDate.toISOString();
            const expireTimestamp = currentDate.valueOf();

            const requestData = {
                "dms_disabled_until": isoTimestamp
            };

            const headers = {
                'Authorization': `Bot ${process.env.BOT_TOKEN}`,
                'Content-Type': 'application/json',
            };

            await axios.put('https://canary.discord.com/api/v9/guilds/820889004055855144/incident-actions', requestData, { headers })
                .then(async () => {
                })
                .catch(() => { })

            await dbUpdateOne(timerSchema, { timer: 'dms' }, { timestamp: expireTimestamp });
        }
    }, 300000);
}