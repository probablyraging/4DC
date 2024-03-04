import { AttachmentBuilder, ApplicationCommandType, ApplicationCommandOptionType } from "discord.js";
import { sendResponse } from '../../../utils/utils.js';
import rankSchema from "../../../schemas/rank_schema.js";
import Canvas from "canvas";
import path from "path";

function kFormatter(num) {
    return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(1)) + "K" : Math.sign(num) * Math.abs(num);
}

export default {
    name: `rank`,
    description: `Fetch a user's rank`,
    cooldown: 1200,
    global: true,
    dm_permission: false,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `username`,
        description: `The user whos rank you want to fetch. Leave blank to fetch your own`,
        type: ApplicationCommandOptionType.User,
        required: false,
    }],
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const { member, options } = interaction;

        await interaction.deferReply().catch(err => console.error(`There was a problem deferring an interaction: `, err));

        const target = options.getMember("username") || member;
        const targetId = target?.user?.id || member?.id;

        // Load default images
        const background = await Canvas.loadImage("./res/images/rankbg.png");

        const results = await rankSchema.find({ userId: targetId });
        // If there are no results
        if (results.length === 0) return sendResponse(interaction, `${target.user.username} isn't ranked yet. They need to send some messages to earn XP`);

        for (const info of results) {
            let { username, rank, level, msgCount, xxp, xxxp } = info;

            const rankPos = parseInt(rank);
            const canvas = Canvas.createCanvas(930, 280);
            const ctx = canvas.getContext("2d");

            // Stretch background to the size of the canvas
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

            // Draw an opaque rectangle ontop of image
            const cornerRadius = 10;
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.beginPath();
            ctx.moveTo(20 + cornerRadius, 30);
            ctx.lineTo(canvas.width - 20 - cornerRadius, 30);
            ctx.arcTo(canvas.width - 20, 30, canvas.width - 20, 30 + cornerRadius, cornerRadius);
            ctx.lineTo(canvas.width - 20, canvas.height - 30 - cornerRadius);
            ctx.arcTo(canvas.width - 20, canvas.height - 30, canvas.width - 20 - cornerRadius, canvas.height - 30, cornerRadius);
            ctx.lineTo(20 + cornerRadius, canvas.height - 30);
            ctx.arcTo(20, canvas.height - 30, 20, canvas.height - 30 - cornerRadius, cornerRadius);
            ctx.lineTo(20, 30 + cornerRadius);
            ctx.arcTo(20, 30, 20 + cornerRadius, 30, cornerRadius);
            ctx.closePath();
            ctx.fill();

            // Not the same as rankPos, this is technically 'level' but we call it 'rank' as it coincides with our rank roles
            ctx.font = "36px grotesk";
            ctx.fillStyle = "#44eaff";
            ctx.fillText(`Rank ${level}`, 243, 90);

            // Trim long usernames
            if (username.length > 20) username = username.slice(0, 20) + "..";
            ctx.font = "36px grotesk";
            ctx.fillStyle = "#ffffff";
            ctx.fillText(username, 243, 140);

            // Format numbers greater than 999
            let xp2 = kFormatter(xxxp);
            let xp3 = kFormatter(xxp);
            let count = kFormatter(msgCount);

            // Message count
            ctx.font = "22px grotesk";
            ctx.fillStyle = "#ffffff";
            ctx.fillText(`Message Count: ${count}`, 243, 220);

            // Current xp and xp needed
            ctx.font = "16px grotesk";
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = 'center';
            ctx.fillText(`${xp3} / ${xp2}`, 798, 149);

            // Position in the leaderboard
            if (rankPos.length >= 5) {
                ctx.font = "45px grotesk";
            } else if (rankPos.length >= 3) {
                ctx.font = "50px grotesk";
            } else {
                ctx.font = "60px grotesk";
            }

            // Flip the canvas so the XP bar fills counter-clockwise
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            const percentage = Math.floor((xxp / xxxp) * 100);
            // Outter XP bar
            ctx.beginPath();
            ctx.lineWidth = 30;
            ctx.strokeStyle = "#484B4E";
            ctx.arc(130, 142, 75, 0, 2 * Math.PI, true);
            ctx.stroke();
            // Inner XP bar
            ctx.beginPath();
            ctx.lineWidth = 20;
            ctx.strokeStyle = "#44eaff";
            ctx.arc(130, 142, 75, 1.5 * Math.PI, (Math.PI * 2) / (100 / percentage) - (Math.PI / 2), false);
            ctx.stroke();

            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);

            // Draw a rounded rectangle to crop our avatar into
            function roundedImage(x, y, width, height, radius) {
                ctx.beginPath();
                ctx.moveTo(x + radius, y);
                ctx.lineTo(x + width - radius, y);
                ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
                ctx.lineTo(x + width, y + height - radius);
                ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                ctx.lineTo(x + radius, y + height);
                ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
                ctx.lineTo(x, y + radius);
                ctx.quadraticCurveTo(x, y, x + radius, y);
                ctx.closePath();
            }
            roundedImage(55, 55, 170, 170, 50);
            ctx.clip();

            // Get a small res version of the user's avatar and draw it onto the canvas
            const avatar = await Canvas.loadImage(target?.user.displayAvatarURL({ extension: 'png', size: 128 }));
            ctx.drawImage(avatar, 55, 55, 170, 170);

            const attachment = new AttachmentBuilder(canvas.toBuffer(), "profile-image.png");

            sendResponse(interaction, ``, [], [attachment]);
        }
    }
};