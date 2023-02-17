const { AttachmentBuilder } = require('discord.js');
const Canvas = require("canvas");
const rankSchema = require('../../schemas/misc/rank_schema');
const countingSchema = require('../../schemas/games/counting_schema');
const letterSchema = require('../../schemas/games/letter_lb_schema');
const cronjob = require('cron').CronJob;
const path = require('path');

function fetchMember(guild, userId) {
    let userDisplayName = guild.members.cache.get(userId)?.displayName || 'Unknown User';
    if (userDisplayName.length > 21) userDisplayName = userDisplayName.slice(0, 21) + '..';
    return userDisplayName
}

function numberWithCommas(x) {
    if (x >= 1000000) {
        return (x / 1000000).toFixed(2) + "M";
    } else {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}

module.exports = async (client) => {
    const leaderboards = new cronjob('*/30 * * * *', async function () {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const leaderboardChan = guild.channels.cache.get(process.env.LB_CHAN);

        await leaderboardChan.messages.fetch().then(messages => {
            messages.forEach(async message => {
                if (message.author.bot || message.author.bot && message.attachments.first()) {
                    // Ranks
                    if (message?.content.includes('rank_lb') || message?.attachments.first()?.name.includes('rank_lb')) {
                        const results = await rankSchema.find({ 'rank': { $gte: 1, $lte: 20 } }).limit(10).sort({ 'rank': 1 });
                        // Left
                        const background = await Canvas.loadImage("./res/images/leaderboard_xp_bg.png");
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
                        ctx.font = "900 22px redhatdisplay";
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
                        ctx.fillStyle = "#5cb6fc";
                        ctx.textAlign = "center";
                        ctx.fillText(`${numberWithCommas(results[0].xp)}`, 412, 126);
                        ctx.fillText(`${numberWithCommas(results[1].xp)}`, 412, 198);
                        ctx.fillText(`${numberWithCommas(results[2].xp)}`, 412, 270);
                        ctx.fillText(`${numberWithCommas(results[3].xp)}`, 412, 344);
                        ctx.fillText(`${numberWithCommas(results[4].xp)}`, 412, 418);
                        ctx.fillText(`${numberWithCommas(results[5].xp)}`, 905, 126);
                        ctx.fillText(`${numberWithCommas(results[6].xp)}`, 905, 198);
                        ctx.fillText(`${numberWithCommas(results[7].xp)}`, 905, 270);
                        ctx.fillText(`${numberWithCommas(results[8].xp)}`, 905, 344);
                        ctx.fillText(`${numberWithCommas(results[9].xp)}`, 905, 418);

                        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: "rank_lb1.png" });

                        message.edit({
                            content: '',
                            files: [attachment]
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a message: `, err));
                    }

                    // Message
                    if (message?.content.includes('message_lb') || message?.attachments.first()?.name.includes('message_lb')) {
                        const results = await rankSchema.find({ 'rank': { $gte: 1, $lt: 20 } });
                        dataArr = [];
                        for (const data of results) {
                            const { userId, username, msgCount, rank, level, avatar, xp } = data;
                            if (username) dataArr.push({ userId, username, msgCount, rank, level, avatar, xp });
                        }
                        dataArr.sort(function (a, b) {
                            return b.msgCount - a.msgCount;
                        });
                        // Image 1
                        const background = await Canvas.loadImage("./res/images/leaderboard_message_bg.png");
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
                        ctx.font = "900 22px redhatdisplay";
                        ctx.fillStyle = "#bebebe"
                        ctx.textAlign = "left";
                        ctx.fillText(`${fetchMember(guild, dataArr[0]?.userId)}`, 110, 126);
                        ctx.fillText(`${fetchMember(guild, dataArr[1]?.userId)}`, 110, 198);
                        ctx.fillText(`${fetchMember(guild, dataArr[2]?.userId)}`, 110, 270);
                        ctx.fillText(`${fetchMember(guild, dataArr[3]?.userId)}`, 110, 344);
                        ctx.fillText(`${fetchMember(guild, dataArr[4]?.userId)}`, 110, 418);
                        ctx.fillText(`${fetchMember(guild, dataArr[5]?.userId)}`, 605, 126);
                        ctx.fillText(`${fetchMember(guild, dataArr[6]?.userId)}`, 605, 198);
                        ctx.fillText(`${fetchMember(guild, dataArr[7]?.userId)}`, 605, 270);
                        ctx.fillText(`${fetchMember(guild, dataArr[8]?.userId)}`, 605, 344);
                        ctx.fillText(`${fetchMember(guild, dataArr[9]?.userId)}`, 605, 418);
                        // Values
                        ctx.fillStyle = "#42ddc2";
                        ctx.textAlign = "center";
                        ctx.fillText(`${numberWithCommas(dataArr[0].msgCount)}`, 412, 126);
                        ctx.fillText(`${numberWithCommas(dataArr[1].msgCount)}`, 412, 198);
                        ctx.fillText(`${numberWithCommas(dataArr[2].msgCount)}`, 412, 270);
                        ctx.fillText(`${numberWithCommas(dataArr[3].msgCount)}`, 412, 344);
                        ctx.fillText(`${numberWithCommas(dataArr[4].msgCount)}`, 412, 418);
                        ctx.fillText(`${numberWithCommas(dataArr[5].msgCount)}`, 905, 126);
                        ctx.fillText(`${numberWithCommas(dataArr[6].msgCount)}`, 905, 198);
                        ctx.fillText(`${numberWithCommas(dataArr[7].msgCount)}`, 905, 270);
                        ctx.fillText(`${numberWithCommas(dataArr[8].msgCount)}`, 905, 344);
                        ctx.fillText(`${numberWithCommas(dataArr[9].msgCount)}`, 905, 418);

                        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: "message_lb1.png" });

                        message.edit({
                            content: '',
                            files: [attachment]
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a message: `, err));
                    }

                    // Counting
                    if (message?.content.includes('count_lb') || message?.attachments.first()?.name.includes('count_lb')) {
                        const results = await countingSchema.find();
                        dataArr = [];
                        for (const data of results) {
                            const { userId, username, avatar, counts } = data;
                            if (username) dataArr.push({ userId, username, avatar, counts });
                        }
                        dataArr.sort(function (a, b) {
                            return b.counts - a.counts;
                        });
                        // Image 1
                        const background = await Canvas.loadImage("./res/images/leaderboard_count_bg.png");
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
                        ctx.font = "900 22px redhatdisplay";
                        ctx.fillStyle = "#bebebe"
                        ctx.textAlign = "left";
                        ctx.fillText(`${fetchMember(guild, dataArr[0]?.userId)}`, 110, 126);
                        ctx.fillText(`${fetchMember(guild, dataArr[1]?.userId)}`, 110, 198);
                        ctx.fillText(`${fetchMember(guild, dataArr[2]?.userId)}`, 110, 270);
                        ctx.fillText(`${fetchMember(guild, dataArr[3]?.userId)}`, 110, 344);
                        ctx.fillText(`${fetchMember(guild, dataArr[4]?.userId)}`, 110, 418);
                        ctx.fillText(`${fetchMember(guild, dataArr[5]?.userId)}`, 605, 126);
                        ctx.fillText(`${fetchMember(guild, dataArr[6]?.userId)}`, 605, 198);
                        ctx.fillText(`${fetchMember(guild, dataArr[7]?.userId)}`, 605, 270);
                        ctx.fillText(`${fetchMember(guild, dataArr[8]?.userId)}`, 605, 344);
                        ctx.fillText(`${fetchMember(guild, dataArr[9]?.userId)}`, 605, 418);
                        // Values
                        ctx.fillStyle = "#f37a7a";
                        ctx.textAlign = "center";
                        ctx.fillText(`${numberWithCommas(dataArr[0].counts)}`, 412, 126);
                        ctx.fillText(`${numberWithCommas(dataArr[1].counts)}`, 412, 198);
                        ctx.fillText(`${numberWithCommas(dataArr[2].counts)}`, 412, 270);
                        ctx.fillText(`${numberWithCommas(dataArr[3].counts)}`, 412, 344);
                        ctx.fillText(`${numberWithCommas(dataArr[4].counts)}`, 412, 418);
                        ctx.fillText(`${numberWithCommas(dataArr[5].counts)}`, 905, 126);
                        ctx.fillText(`${numberWithCommas(dataArr[6].counts)}`, 905, 198);
                        ctx.fillText(`${numberWithCommas(dataArr[7].counts)}`, 905, 270);
                        ctx.fillText(`${numberWithCommas(dataArr[8].counts)}`, 905, 344);
                        ctx.fillText(`${numberWithCommas(dataArr[9].counts)}`, 905, 418);

                        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: "count_lb1.png" });

                        message.edit({
                            content: '',
                            files: [attachment]
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a message: `, err));
                    }

                    // Last Letter
                    if (message?.content.includes('letter_lb') || message?.attachments.first()?.name.includes('letter_lb')) {
                        const results = await letterSchema.find();
                        dataArr = [];
                        for (const data of results) {
                            const { userId, username, avatar, correctCount } = data;
                            if (username) dataArr.push({ userId, username, avatar, correctCount });
                        }
                        dataArr.sort(function (a, b) {
                            return b.correctCount - a.correctCount;
                        });
                        // Image 1
                        const background = await Canvas.loadImage("./res/images/leaderboard_letter_bg.png");
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
                        ctx.font = "900 22px redhatdisplay";
                        ctx.fillStyle = "#bebebe"
                        ctx.textAlign = "left";
                        ctx.fillText(`${fetchMember(guild, dataArr[0]?.userId)}`, 110, 126);
                        ctx.fillText(`${fetchMember(guild, dataArr[1]?.userId)}`, 110, 198);
                        ctx.fillText(`${fetchMember(guild, dataArr[2]?.userId)}`, 110, 270);
                        ctx.fillText(`${fetchMember(guild, dataArr[3]?.userId)}`, 110, 344);
                        ctx.fillText(`${fetchMember(guild, dataArr[4]?.userId)}`, 110, 418);
                        ctx.fillText(`${fetchMember(guild, dataArr[5]?.userId)}`, 605, 126);
                        ctx.fillText(`${fetchMember(guild, dataArr[6]?.userId)}`, 605, 198);
                        ctx.fillText(`${fetchMember(guild, dataArr[7]?.userId)}`, 605, 270);
                        ctx.fillText(`${fetchMember(guild, dataArr[8]?.userId)}`, 605, 344);
                        ctx.fillText(`${fetchMember(guild, dataArr[9]?.userId)}`, 605, 418);
                        // Values
                        ctx.fillStyle = "#e2b450";
                        ctx.textAlign = "center";
                        ctx.fillText(`${numberWithCommas(dataArr[0].correctCount)}`, 412, 126);
                        ctx.fillText(`${numberWithCommas(dataArr[1].correctCount)}`, 412, 198);
                        ctx.fillText(`${numberWithCommas(dataArr[2].correctCount)}`, 412, 270);
                        ctx.fillText(`${numberWithCommas(dataArr[3].correctCount)}`, 412, 344);
                        ctx.fillText(`${numberWithCommas(dataArr[4].correctCount)}`, 412, 418);
                        ctx.fillText(`${numberWithCommas(dataArr[5].correctCount)}`, 905, 126);
                        ctx.fillText(`${numberWithCommas(dataArr[6].correctCount)}`, 905, 198);
                        ctx.fillText(`${numberWithCommas(dataArr[7].correctCount)}`, 905, 270);
                        ctx.fillText(`${numberWithCommas(dataArr[8].correctCount)}`, 905, 344);
                        ctx.fillText(`${numberWithCommas(dataArr[9].correctCount)}`, 905, 418);

                        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: "letter_lb1.png" });

                        message.edit({
                            content: '',
                            files: [attachment]
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a message: `, err));
                    }

                    // Timer
                    if (message?.content.includes('timer_lb') || message?.content.includes('update')) {
                        message.edit({
                            content: `*Leaderboards update <t:${Math.round((new Date() / 1000) + 1800)}:R>*`
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a message: `, err));
                    }
                }
            });
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem fetching message: `, err));
    });
    leaderboards.start();
}