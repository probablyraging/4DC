const { Message, AttachmentBuilder } = require('discord.js');
const Canvas = require("canvas");
const rankSchema = require('../../schemas/misc/rank_schema');
const countingSchema = require('../../schemas/counting_game/counting_schema');
const letterSchema = require('../../schemas/letter_game/letter_lb_schema');
const cronjob = require('cron').CronJob;
const path = require('path');
/**
 * 
 * @param {Message} message 
 */

function numberWithCommas(x) {
    return x?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

module.exports = async (client) => {
    // const leaderboards = new cronjob('*/10 * * * *', async function () {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const leaderboardChan = guild.channels.cache.get(process.env.LB_CHAN);

        await leaderboardChan.messages.fetch().then(messages => {
            messages.forEach(async message => {
                if (message.author.bot || message.author.bot && message.attachments.first()) {
                    // Ranks
                    if (message?.content.includes('rank_lb') || message?.attachments.first()?.name.includes('rank_lb')) {
                        const results = await rankSchema.find({ 'rank': { $gte: 1, $lte: 20 } }).limit(10).sort({ 'rank': 1 });
                        // Image 1
                        const background = await Canvas.loadImage("./res/images/leaderboard_rank_bg.png");
                        const canvas = Canvas.createCanvas(930, 480);
                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                        // Position
                        ctx.font = "900 30px redhatdisplay";
                        ctx.fillStyle = "#fff";
                        ctx.textAlign = "center";
                        ctx.fillText(`1`, 31, 134);
                        ctx.fillText(`2`, 32, 214);
                        ctx.fillText(`3`, 32, 294);
                        ctx.fillText(`4`, 32, 374);
                        ctx.fillText(`5`, 32, 454);
                        // Username
                        ctx.font = "900 38px redhatdisplay";
                        ctx.textAlign = "left";
                        ctx.fillText(`${guild.members.cache.get(results[0].id).user.username}`, 78, 134);
                        ctx.fillText(`${guild.members.cache.get(results[1].id).user.username}`, 78, 214);
                        ctx.fillText(`${guild.members.cache.get(results[2].id).user.username}`, 78, 294);
                        ctx.fillText(`${guild.members.cache.get(results[3].id).user.username}`, 78, 374);
                        ctx.fillText(`${guild.members.cache.get(results[4].id).user.username}`, 78, 454);
                        // Values
                        ctx.fillStyle = "#5cb6fc";
                        ctx.textAlign = "right";
                        ctx.fillText(`${numberWithCommas(results[0].xp)}`, 760, 134);
                        ctx.fillText(`${numberWithCommas(results[1].xp)}`, 760, 214);
                        ctx.fillText(`${numberWithCommas(results[2].xp)}`, 760, 294);
                        ctx.fillText(`${numberWithCommas(results[3].xp)}`, 760, 374);
                        ctx.fillText(`${numberWithCommas(results[4].xp)}`, 760, 454);
                        // XP
                        ctx.fillStyle = "#fff";
                        ctx.textAlign = "left";
                        ctx.fillText(`XP`, 780, 134);
                        ctx.fillText(`XP`, 780, 214);
                        ctx.fillText(`XP`, 780, 294);
                        ctx.fillText(`XP`, 780, 374);
                        ctx.fillText(`XP`, 780, 454);

                        // Image 2
                        const background2 = await Canvas.loadImage("./res/images/leaderboard_rank_bg2.png");
                        const canvas2 = Canvas.createCanvas(930, 420);
                        const ctx2 = canvas2.getContext("2d");
                        ctx2.drawImage(background2, 0, 0, canvas2.width, canvas2.height);
                        ctx2.font = "900 30px redhatdisplay";
                        ctx2.fillStyle = "#fff";
                        ctx2.textAlign = "center";
                        // Position
                        ctx2.fillText(`6`, 32, 46);
                        ctx2.fillText(`7`, 33, 126);
                        ctx2.fillText(`8`, 33, 206);
                        ctx2.fillText(`9`, 33, 286);
                        ctx2.fillText(`10`, 33, 366);
                        // Username
                        ctx2.font = "900 38px redhatdisplay";
                        ctx2.textAlign = "left";
                        ctx2.fillText(`${guild.members.cache.get(results[5].id).user.username}`, 78, 46);
                        ctx2.fillText(`${guild.members.cache.get(results[6].id).user.username}`, 78, 126);
                        ctx2.fillText(`${guild.members.cache.get(results[7].id).user.username}`, 78, 206);
                        ctx2.fillText(`${guild.members.cache.get(results[8].id).user.username}`, 78, 286);
                        ctx2.fillText(`${guild.members.cache.get(results[9].id).user.username}`, 78, 366);
                        // Values
                        ctx2.fillStyle = "#5cb6fc";
                        ctx2.textAlign = "right";
                        ctx2.fillText(`${numberWithCommas(results[5].xp)}`, 760, 46);
                        ctx2.fillText(`${numberWithCommas(results[6].xp)}`, 760, 126);
                        ctx2.fillText(`${numberWithCommas(results[7].xp)}`, 760, 206);
                        ctx2.fillText(`${numberWithCommas(results[8].xp)}`, 760, 286);
                        ctx2.fillText(`${numberWithCommas(results[9].xp)}`, 760, 366);
                        // XP
                        ctx2.fillStyle = "#fff";
                        ctx2.textAlign = "left";
                        ctx2.fillText(`XP`, 780, 46);
                        ctx2.fillText(`XP`, 780, 126);
                        ctx2.fillText(`XP`, 780, 206);
                        ctx2.fillText(`XP`, 780, 286);
                        ctx2.fillText(`XP`, 780, 366);

                        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: "rank_lb1.png" });
                        const attachment2 = new AttachmentBuilder(canvas2.toBuffer(), { name: "rank_lb2.png" });

                        message.edit({
                            content: '',
                            files: [attachment, attachment2]
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a message: `, err));
                    }

                    // Message
                    if (message?.content.includes('message_lb') || message?.attachments.first()?.name.includes('message_lb')) {
                        const results = await rankSchema.find({ 'rank': { $gte: 1, $lt: 20 } }).limit(10);
                        dataArr = [];
                        for (const data of results) {
                            const { id, username, msgCount, rank, level, avatar, xp } = data;
                            if (username) dataArr.push({ id, username, msgCount, rank, level, avatar, xp });
                        }
                        dataArr.sort(function (a, b) {
                            return b.msgCount - a.msgCount;
                        });
                        // Image 1
                        const background = await Canvas.loadImage("./res/images/leaderboard_message_bg.png");
                        const canvas = Canvas.createCanvas(930, 480);
                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                        // Position
                        ctx.font = "900 30px redhatdisplay";
                        ctx.fillStyle = "#fff";
                        ctx.textAlign = "center";
                        ctx.fillText(`1`, 31, 134);
                        ctx.fillText(`2`, 32, 214);
                        ctx.fillText(`3`, 32, 294);
                        ctx.fillText(`4`, 32, 374);
                        ctx.fillText(`5`, 32, 454);
                        // Username
                        ctx.font = "900 38px redhatdisplay";
                        ctx.textAlign = "left";
                        ctx.fillText(`${guild.members.cache.get(dataArr[0].id).user.username}`, 78, 134);
                        ctx.fillText(`${guild.members.cache.get(dataArr[1].id).user.username}`, 78, 214);
                        ctx.fillText(`${guild.members.cache.get(dataArr[2].id).user.username}`, 78, 294);
                        ctx.fillText(`${guild.members.cache.get(dataArr[3].id).user.username}`, 78, 374);
                        ctx.fillText(`${guild.members.cache.get(dataArr[4].id).user.username}`, 78, 454);
                        // Values
                        ctx.fillStyle = "#85f9b3";
                        ctx.textAlign = "right";
                        ctx.fillText(`${numberWithCommas(dataArr[0].msgCount)}`, 760, 134);
                        ctx.fillText(`${numberWithCommas(dataArr[1].msgCount)}`, 760, 214);
                        ctx.fillText(`${numberWithCommas(dataArr[2].msgCount)}`, 760, 294);
                        ctx.fillText(`${numberWithCommas(dataArr[3].msgCount)}`, 760, 374);
                        ctx.fillText(`${numberWithCommas(dataArr[4].msgCount)}`, 760, 454);
                        // XP
                        ctx.fillStyle = "#fff";
                        ctx.textAlign = "left";
                        ctx.fillText(`MSGS`, 780, 134);
                        ctx.fillText(`MSGS`, 780, 214);
                        ctx.fillText(`MSGS`, 780, 294);
                        ctx.fillText(`MSGS`, 780, 374);
                        ctx.fillText(`MSGS`, 780, 454);

                        // Image 2
                        const background2 = await Canvas.loadImage("./res/images/leaderboard_message_bg2.png");
                        const canvas2 = Canvas.createCanvas(930, 420);
                        const ctx2 = canvas2.getContext("2d");
                        ctx2.drawImage(background2, 0, 0, canvas2.width, canvas2.height);
                        ctx2.font = "900 30px redhatdisplay";
                        ctx2.fillStyle = "#fff";
                        ctx2.textAlign = "center";
                        // Position
                        ctx2.fillText(`6`, 32, 46);
                        ctx2.fillText(`7`, 33, 126);
                        ctx2.fillText(`8`, 33, 206);
                        ctx2.fillText(`9`, 33, 286);
                        ctx2.fillText(`10`, 33, 366);
                        // Username
                        ctx2.font = "900 38px redhatdisplay";
                        ctx2.textAlign = "left";
                        ctx2.fillText(`${guild.members.cache.get(dataArr[5].id).user.username}`, 78, 46);
                        ctx2.fillText(`${guild.members.cache.get(dataArr[6].id).user.username}`, 78, 126);
                        ctx2.fillText(`${guild.members.cache.get(dataArr[7].id).user.username}`, 78, 206);
                        ctx2.fillText(`${guild.members.cache.get(dataArr[8].id).user.username}`, 78, 286);
                        ctx2.fillText(`${guild.members.cache.get(dataArr[9].id).user.username}`, 78, 366);
                        // Values
                        ctx2.fillStyle = "#85f9b3";
                        ctx2.textAlign = "right";
                        ctx2.fillText(`${numberWithCommas(dataArr[5].msgCount)}`, 760, 46);
                        ctx2.fillText(`${numberWithCommas(dataArr[6].msgCount)}`, 760, 126);
                        ctx2.fillText(`${numberWithCommas(dataArr[7].msgCount)}`, 760, 206);
                        ctx2.fillText(`${numberWithCommas(dataArr[8].msgCount)}`, 760, 286);
                        ctx2.fillText(`${numberWithCommas(dataArr[9].msgCount)}`, 760, 366);
                        // XP
                        ctx2.fillStyle = "#fff";
                        ctx2.textAlign = "left";
                        ctx2.fillText(`MSGS`, 780, 46);
                        ctx2.fillText(`MSGS`, 780, 126);
                        ctx2.fillText(`MSGS`, 780, 206);
                        ctx2.fillText(`MSGS`, 780, 286);
                        ctx2.fillText(`MSGS`, 780, 366);

                        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: "message_lb1.png" });
                        const attachment2 = new AttachmentBuilder(canvas2.toBuffer(), { name: "message_lb2.png" });

                        message.edit({
                            content: '',
                            files: [attachment, attachment2]
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
                        const canvas = Canvas.createCanvas(930, 480);
                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                        // Position
                        ctx.font = "900 30px redhatdisplay";
                        ctx.fillStyle = "#fff";
                        ctx.textAlign = "center";
                        ctx.fillText(`1`, 31, 134);
                        ctx.fillText(`2`, 32, 214);
                        ctx.fillText(`3`, 32, 294);
                        ctx.fillText(`4`, 32, 374);
                        ctx.fillText(`5`, 32, 454);
                        // Username
                        ctx.font = "900 38px redhatdisplay";
                        ctx.textAlign = "left";
                        ctx.fillText(`${guild.members.cache.get(dataArr[0].userId).user.username}`, 78, 134);
                        ctx.fillText(`${guild.members.cache.get(dataArr[1].userId).user.username}`, 78, 214);
                        ctx.fillText(`${guild.members.cache.get(dataArr[2].userId).user.username}`, 78, 294);
                        ctx.fillText(`${guild.members.cache.get(dataArr[3].userId).user.username}`, 78, 374);
                        ctx.fillText(`${guild.members.cache.get(dataArr[4].userId).user.username}`, 78, 454);
                        // Values
                        ctx.fillStyle = "#eaf986";
                        ctx.textAlign = "right";
                        ctx.fillText(`${numberWithCommas(dataArr[0].counts)}`, 760, 134);
                        ctx.fillText(`${numberWithCommas(dataArr[1].counts)}`, 760, 214);
                        ctx.fillText(`${numberWithCommas(dataArr[2].counts)}`, 760, 294);
                        ctx.fillText(`${numberWithCommas(dataArr[3].counts)}`, 760, 374);
                        ctx.fillText(`${numberWithCommas(dataArr[4].counts)}`, 760, 454);
                        // XP
                        ctx.fillStyle = "#fff";
                        ctx.textAlign = "left";
                        ctx.fillText(`POINTS`, 780, 134);
                        ctx.fillText(`POINTS`, 780, 214);
                        ctx.fillText(`POINTS`, 780, 294);
                        ctx.fillText(`POINTS`, 780, 374);
                        ctx.fillText(`POINTS`, 780, 454);

                        // Image 2
                        const background2 = await Canvas.loadImage("./res/images/leaderboard_count_bg2.png");
                        const canvas2 = Canvas.createCanvas(930, 420);
                        const ctx2 = canvas2.getContext("2d");
                        ctx2.drawImage(background2, 0, 0, canvas2.width, canvas2.height);
                        ctx2.font = "900 30px redhatdisplay";
                        ctx2.fillStyle = "#fff";
                        ctx2.textAlign = "center";
                        // Position
                        ctx2.fillText(`6`, 32, 46);
                        ctx2.fillText(`7`, 33, 126);
                        ctx2.fillText(`8`, 33, 206);
                        ctx2.fillText(`9`, 33, 286);
                        ctx2.fillText(`10`, 33, 366);
                        // Username
                        ctx2.font = "900 38px redhatdisplay";
                        ctx2.textAlign = "left";
                        ctx2.fillText(`${guild.members.cache.get(dataArr[5].userId).user.username}`, 78, 46);
                        ctx2.fillText(`${guild.members.cache.get(dataArr[6].userId).user.username}`, 78, 126);
                        ctx2.fillText(`${guild.members.cache.get(dataArr[7].userId).user.username}`, 78, 206);
                        ctx2.fillText(`${guild.members.cache.get(dataArr[8].userId).user.username}`, 78, 286);
                        ctx2.fillText(`${guild.members.cache.get(dataArr[9].userId).user.username}`, 78, 366);
                        // Values
                        ctx2.fillStyle = "#eaf986";
                        ctx2.textAlign = "right";
                        ctx2.fillText(`${numberWithCommas(dataArr[5].counts)}`, 760, 46);
                        ctx2.fillText(`${numberWithCommas(dataArr[6].counts)}`, 760, 126);
                        ctx2.fillText(`${numberWithCommas(dataArr[7].counts)}`, 760, 206);
                        ctx2.fillText(`${numberWithCommas(dataArr[8].counts)}`, 760, 286);
                        ctx2.fillText(`${numberWithCommas(dataArr[9].counts)}`, 760, 366);
                        // XP
                        ctx2.fillStyle = "#fff";
                        ctx2.textAlign = "left";
                        ctx2.fillText(`POINTS`, 780, 46);
                        ctx2.fillText(`POINTS`, 780, 126);
                        ctx2.fillText(`POINTS`, 780, 206);
                        ctx2.fillText(`POINTS`, 780, 286);
                        ctx2.fillText(`POINTS`, 780, 366);

                        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: "count_lb1.png" });
                        const attachment2 = new AttachmentBuilder(canvas2.toBuffer(), { name: "count_lb2.png" });

                        message.edit({
                            content: '',
                            files: [attachment, attachment2]
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
                        const canvas = Canvas.createCanvas(930, 480);
                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                        // Position
                        ctx.font = "900 30px redhatdisplay";
                        ctx.fillStyle = "#fff";
                        ctx.textAlign = "center";
                        ctx.fillText(`1`, 31, 134);
                        ctx.fillText(`2`, 32, 214);
                        ctx.fillText(`3`, 32, 294);
                        ctx.fillText(`4`, 32, 374);
                        ctx.fillText(`5`, 32, 454);
                        // Username
                        ctx.font = "900 38px redhatdisplay";
                        ctx.textAlign = "left";
                        ctx.fillText(`${guild.members.cache.get(dataArr[0].userId).user.username}`, 78, 134);
                        ctx.fillText(`${guild.members.cache.get(dataArr[1].userId).user.username}`, 78, 214);
                        ctx.fillText(`${guild.members.cache.get(dataArr[2].userId).user.username}`, 78, 294);
                        ctx.fillText(`${guild.members.cache.get(dataArr[3].userId).user.username}`, 78, 374);
                        ctx.fillText(`${guild.members.cache.get(dataArr[4].userId).user.username}`, 78, 454);
                        // Values
                        ctx.fillStyle = "#f39f54";
                        ctx.textAlign = "right";
                        ctx.fillText(`${numberWithCommas(dataArr[0].correctCount)}`, 760, 134);
                        ctx.fillText(`${numberWithCommas(dataArr[1].correctCount)}`, 760, 214);
                        ctx.fillText(`${numberWithCommas(dataArr[2].correctCount)}`, 760, 294);
                        ctx.fillText(`${numberWithCommas(dataArr[3].correctCount)}`, 760, 374);
                        ctx.fillText(`${numberWithCommas(dataArr[4].correctCount)}`, 760, 454);
                        // XP
                        ctx.fillStyle = "#fff";
                        ctx.textAlign = "left";
                        ctx.fillText(`POINTS`, 780, 134);
                        ctx.fillText(`POINTS`, 780, 214);
                        ctx.fillText(`POINTS`, 780, 294);
                        ctx.fillText(`POINTS`, 780, 374);
                        ctx.fillText(`POINTS`, 780, 454);

                        // Image 2
                        const background2 = await Canvas.loadImage("./res/images/leaderboard_letter_bg2.png");
                        const canvas2 = Canvas.createCanvas(930, 420);
                        const ctx2 = canvas2.getContext("2d");
                        ctx2.drawImage(background2, 0, 0, canvas2.width, canvas2.height);
                        ctx2.font = "900 30px redhatdisplay";
                        ctx2.fillStyle = "#fff";
                        ctx2.textAlign = "center";
                        // Position
                        ctx2.fillText(`6`, 32, 46);
                        ctx2.fillText(`7`, 33, 126);
                        ctx2.fillText(`8`, 33, 206);
                        ctx2.fillText(`9`, 33, 286);
                        ctx2.fillText(`10`, 33, 366);
                        // Username
                        ctx2.font = "900 38px redhatdisplay";
                        ctx2.textAlign = "left";
                        ctx2.fillText(`${guild.members.cache.get(dataArr[5].userId).user.username}`, 78, 46);
                        ctx2.fillText(`${guild.members.cache.get(dataArr[6].userId).user.username}`, 78, 126);
                        ctx2.fillText(`${guild.members.cache.get(dataArr[7].userId).user.username}`, 78, 206);
                        ctx2.fillText(`${guild.members.cache.get(dataArr[8].userId).user.username}`, 78, 286);
                        ctx2.fillText(`${guild.members.cache.get(dataArr[9].userId).user.username}`, 78, 366);
                        // Values
                        ctx2.fillStyle = "#f39f54";
                        ctx2.textAlign = "right";
                        ctx2.fillText(`${numberWithCommas(dataArr[5].correctCount)}`, 760, 46);
                        ctx2.fillText(`${numberWithCommas(dataArr[6].correctCount)}`, 760, 126);
                        ctx2.fillText(`${numberWithCommas(dataArr[7].correctCount)}`, 760, 206);
                        ctx2.fillText(`${numberWithCommas(dataArr[8].correctCount)}`, 760, 286);
                        ctx2.fillText(`${numberWithCommas(dataArr[9].correctCount)}`, 760, 366);
                        // XP
                        ctx2.fillStyle = "#fff";
                        ctx2.textAlign = "left";
                        ctx2.fillText(`POINTS`, 780, 46);
                        ctx2.fillText(`POINTS`, 780, 126);
                        ctx2.fillText(`POINTS`, 780, 206);
                        ctx2.fillText(`POINTS`, 780, 286);
                        ctx2.fillText(`POINTS`, 780, 366);

                        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: "letter_lb1.png" });
                        const attachment2 = new AttachmentBuilder(canvas2.toBuffer(), { name: "letter_lb2.png" });

                        message.edit({
                            content: '',
                            files: [attachment, attachment2]
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a message: `, err));
                    }

                    // Timer
                    if (message?.content.includes('timer_lb') || message?.content.includes('update')) {
                        message.edit({
                            content: `*Leaderboards update <t:${Math.round((new Date() / 1000) + 600)}:R>*`
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a message: `, err));
                    }
                }
            });
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem fetching message: `, err));
    // });
    // leaderboards.start();
}