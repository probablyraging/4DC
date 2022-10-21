const { AttachmentBuilder, ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");
const rankSchema = require("../../../schemas/misc/rank_schema");
const Canvas = require("canvas");
const path = require("path");

function kFormatter(num) {
    return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(1)) + "K" : Math.sign(num) * Math.abs(num);
}

module.exports = {
    name: `rank`,
    description: `Fetch a user's rank`,
    cooldown: 1200,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `username`,
        description: `The user whos rank you want to fetch. Leave blank to fetch your own`,
        type: ApplicationCommandOptionType.User,
        required: false,
    }],
    /**
     *
     * @param {ContextMenuInteraction} interaction
     */
    async execute(interaction) {
        const { member, options } = interaction;

        await interaction.deferReply().catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const target = options.getMember("username") || member;
        const targetId = target?.user?.id || member?.id;

        // Load default images
        const background = await Canvas.loadImage("./res/images/rankbg.png");

        const results = await rankSchema.find({ id: targetId }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));

        if (results.length === 0) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} ${target.user.tag} isn't ranked yet. They need to send some messages to earn XP`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }

        for (const info of results) {
            let { username, discrim, rank, level, msgCount, xxp, xxxp } = info;

            const rankPos = parseInt(rank);
            const canvas = Canvas.createCanvas(930, 280);
            const ctx = canvas.getContext("2d");

            // stretch background to the size of the canvas
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

            // draw an opaque rectangle ontop of image
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.fillRect(20, 30, canvas.width - 40, canvas.height - 60);

            // not the same as rankPos, this is technically 'level' but we call it 'rank' as it coincides with our rank roles
            ctx.font = "36px grotesk";
            ctx.fillStyle = "#44eaff";
            ctx.fillText(`Rank ${level}`, 243, 90);

            // try to compensate for long usernames
            let userDiscrim = username + "#" + discrim;
            if (userDiscrim.length > 25) {
                ctx.font = "30px grotesk";
                userDiscrim = userDiscrim.slice(0, 25) + "...";
            } else if (userDiscrim.length > 20) {
                ctx.font = "30px grotesk";
            } else {
                ctx.font = "36px grotesk";
            }
            ctx.fillStyle = "#ffffff";
            ctx.fillText(userDiscrim, 243, 140);

            // k formatter for numbers greater than 999
            let xp2 = kFormatter(xxxp);
            let xp3 = kFormatter(xxp);
            let count = kFormatter(msgCount);

            // message count
            ctx.font = "22px grotesk";
            ctx.fillStyle = "#ffffff";
            ctx.fillText(`Message Count: ${count}`, 243, 220);

            // current xp and xp needed
            ctx.font = "16px grotesk";
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = 'center';
            ctx.fillText(`${xp3} / ${xp2}`, 798, 149);

            // position in the leaderboard
            if (rankPos.length >= 5) {
                ctx.font = "45px grotesk";
            } else if (rankPos.length >= 3) {
                ctx.font = "50px grotesk";
            } else {
                ctx.font = "60px grotesk";
            }

            // flip the canvas so the XP bar fills counter-clockwise
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            const percentage = Math.floor((xxp / xxxp) * 100);
            // outter XP bar
            ctx.beginPath();
            ctx.lineWidth = 30;
            ctx.strokeStyle = "#484B4E";
            ctx.arc(130, 142, 75, 0, 2 * Math.PI, true);
            ctx.stroke();
            // inner XP bar
            ctx.beginPath();
            ctx.lineWidth = 20;
            ctx.strokeStyle = "#44eaff";
            ctx.arc(130, 142, 75, 1.5 * Math.PI, (Math.PI * 2) / (100 / percentage) - (Math.PI / 2), false);
            ctx.stroke();

            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);

            // draw a rounded rectangle to crop our avatar into
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
            // get a small res version of the user's avatar and draw it onto the canvas
            const avatarURL = target?.user.displayAvatarURL() + "?size=128";
            const avatar = await Canvas.loadImage(avatarURL.replace('webp', 'png'));
            ctx.drawImage(avatar, 55, 55, 170, 170);

            const attachment = new AttachmentBuilder(canvas.toBuffer(), "profile-image.png");

            interaction.editReply({
                files: [attachment]
            }).catch(err => console.error(`${path.basename(__filename)} There was a sending an interaction: `, err));
        }
    }
};