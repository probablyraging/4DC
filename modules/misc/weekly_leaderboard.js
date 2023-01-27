const { AttachmentBuilder } = require('discord.js');
const { dbFindOne, dbUpdateOne, dbDeleteMany } = require('../../utils/utils');
const Canvas = require("canvas");
const userWeeklyMessageCount = require('../../schemas/misc/weekly_leaderboard_schema');
const timerSchema = require('../../schemas/misc/timer_schema');
const cronjob = require('cron').CronJob;
const path = require('path');

function fetchMember(guild, userId) {
    let userDisplayName = guild.members.cache.get(userId)?.displayName || 'Empty';
    if (userDisplayName.length > 21) userDisplayName = userDisplayName.slice(0, 21) + '..';
    return userDisplayName;
}

function numberWithCommas(x) {
    if (!x) return 0;
    if (x >= 1000000) {
        return (x / 1000000).toFixed(2) + "M";
    } else {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}

module.exports = async (client) => {
    const leaderboards = new cronjob('0 */3 * * *', async function () {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const generalChan = guild.channels.cache.get(process.env.GENERAL_CHAN);
        // Check leaderboard timestamp and reset if expired
        const leaderboardTimer = await dbFindOne(timerSchema, { timer: 'leaderboard' });
        const myDate = new Date();
        const addOneWeek = myDate.getTime() + (24 * 7 * 60 * 60 * 1000);
        if (!leaderboardTimer?.timestamp || myDate.valueOf() > leaderboardTimer?.timestamp) {
            await dbDeleteMany(userWeeklyMessageCount, {});
            await dbUpdateOne(timerSchema, { timer: 'leaderboard' }, { timestamp: addOneWeek });
        };

        const results = await userWeeklyMessageCount.find().sort({ msgCount: -1 }).limit(10);
        // Image 1
        const background = await Canvas.loadImage("./res/images/leaderboard_weekly_bg.png");
        const canvas = Canvas.createCanvas(1000, 480);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        // Position
        ctx.font = "900 28px redhatdisplay";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText(`1`, 65, 128);
        ctx.fillText(`2`, 65, 202);
        ctx.fillText(`3`, 65, 274);
        ctx.fillText(`4`, 65, 348);
        ctx.fillText(`5`, 65, 422);
        ctx.fillText(`6`, 560, 128);
        ctx.fillText(`7`, 560, 202);
        ctx.fillText(`8`, 560, 274);
        ctx.fillText(`9`, 560, 348);
        ctx.fillText(`10`, 560, 422);
        // Username
        ctx.font = "900 22px ubuntu";
        ctx.fillStyle = "#bebebe"
        ctx.textAlign = "left";
        ctx.fillText(`${fetchMember(guild, results[0]?.userId)}`, 110, 126);
        ctx.fillText(`${fetchMember(guild, results[1]?.userId)}`, 110, 198);
        ctx.fillText(`${fetchMember(guild, results[2]?.userId)}`, 110, 270);
        ctx.fillText(`${fetchMember(guild, results[3]?.userId)}`, 110, 344);
        ctx.fillText(`${fetchMember(guild, results[4]?.userId)}`, 110, 418);
        ctx.fillText(`${fetchMember(guild, results[5]?.userId)}`, 605, 126);
        ctx.fillText(`${fetchMember(guild, results[6]?.userId)}`, 605, 198);
        ctx.fillText(`${fetchMember(guild, results[7]?.userId)}`, 605, 270);
        ctx.fillText(`${fetchMember(guild, results[8]?.userId)}`, 605, 344);
        ctx.fillText(`${fetchMember(guild, results[9]?.userId)}`, 605, 418);
        // Values
        ctx.fillStyle = "#42ddc2";
        ctx.textAlign = "center";
        ctx.fillText(`${numberWithCommas(results[0]?.msgCount)}`, 412, 126);
        ctx.fillText(`${numberWithCommas(results[1]?.msgCount)}`, 412, 198);
        ctx.fillText(`${numberWithCommas(results[2]?.msgCount)}`, 412, 270);
        ctx.fillText(`${numberWithCommas(results[3]?.msgCount)}`, 412, 344);
        ctx.fillText(`${numberWithCommas(results[4]?.msgCount)}`, 412, 418);
        ctx.fillText(`${numberWithCommas(results[5]?.msgCount)}`, 905, 126);
        ctx.fillText(`${numberWithCommas(results[6]?.msgCount)}`, 905, 198);
        ctx.fillText(`${numberWithCommas(results[7]?.msgCount)}`, 905, 270);
        ctx.fillText(`${numberWithCommas(results[8]?.msgCount)}`, 905, 344);
        ctx.fillText(`${numberWithCommas(results[9]?.msgCount)}`, 905, 418);

        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: "weekly_lb1.png" });

        generalChan.send({
            content: '',
            files: [attachment]
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a message: `, err));
    });
    leaderboards.start();
}