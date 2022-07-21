const { AttachmentBuilder, ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");
const rankSchema = require("../../../schemas/misc/rank_schema");
const Canvas = require("canvas");
const path = require("path");

function kFormatter(num) {
    return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(1)) + "K" : Math.sign(num) * Math.abs(num);
}

module.exports = {
    name: `rank`,
    description: `Fetch your, or someone else's rank`,
    access: '',
    cooldown: 1200,
    type: ApplicationCommandType.ChatInput,
    usage: `/rank`,
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
        const { guild, channel, member, options } = interaction;

        await interaction.deferReply().catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));;

        const target = options.getMember("username") || member;
        const targetId = target?.user?.id || member?.id;

        // Load default images
        const background = await Canvas.loadImage("./res/images/rankbg.jpg");
        const rankFirst = await Canvas.loadImage("./res/images/firstplace.png");
        const rankSecond = await Canvas.loadImage("./res/images/secondplace.png");
        const rankThird = await Canvas.loadImage("./res/images/thirdplace.png");

        const results = await rankSchema.find({ id: targetId }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));

        if (results.length === 0) {
            return interaction.editReply(`${process.env.BOT_DENY} \`${target.user.tag} isn't ranked yet. They need to send some messages to earn XP.\``)
                .catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
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

            // try to compensate for long usernames
            let userDiscrim = username + "#" + discrim;
            if (userDiscrim.length > 30) {
                ctx.font = "30px grotesk";
                userDiscrim = userDiscrim.slice(0, 25) + "...";
            } else if (userDiscrim.length > 20) {
                ctx.font = "30px grotesk";
            } else {
                ctx.font = "37px grotesk";
            }
            ctx.fillStyle = "#ffffff";
            ctx.fillText(userDiscrim, canvas.width / 3.8, canvas.height / 2.8);

            // not the same as rankPos, this is technically 'level' but we call it 'rank' as it coincides with our rank roles
            ctx.font = "35px grotesk";
            ctx.fillStyle = "#44eaff";
            ctx.fillText(`Rank ${level}`, canvas.width / 3.8, canvas.height / 1.6);

            // k formatter for numbers greater than 999
            let xp2 = kFormatter(xxxp);
            let xp3 = kFormatter(xxp);
            let count = kFormatter(msgCount);

            // message count
            ctx.font = "23px grotesk";
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "right";
            ctx.fillText(`Message Count: ${count}`, canvas.width / 1.16, canvas.height / 1.6);

            // draw and fill our xp bar
            const percentage = Math.floor((xxp / xxxp) * 100);
            const roundedPercent = Math.round(percentage);

            const testPerc = 100;
            for (let i = 0; i < testPerc; i++) {
                ctx.beginPath();
                ctx.lineWidth = 14;
                ctx.strokeStyle = "#484B4E";
                ctx.fillStyle = "#484B4E";
                ctx.arc(260 + (i * 5.32), 205, 8, 0, Math.PI * 2, true);
                ctx.stroke();
                ctx.fill();
            }

            for (let i = 0; i < roundedPercent; i++) {
                ctx.beginPath();
                ctx.lineWidth = 14;
                ctx.strokeStyle = "#44eaff";
                ctx.fillStyle = "#44eaff";
                ctx.arc(260 + (i * 5.32), 205, 5.5, 0, Math.PI * 2, true);
                ctx.stroke();
                ctx.fill();
            }

            // current xp and xp needed
            ctx.font = "24px grotesk";
            ctx.fillStyle = "#000000";
            ctx.fillText(`${xp3} / ${xp2} XP`, canvas.width / 1.525, canvas.height / 1.30);

            // position in the leaderboard
            if (rankPos.length >= 5) {
                ctx.font = "45px grotesk";
            } else if (rankPos.length >= 3) {
                ctx.font = "50px grotesk";
            } else {
                ctx.font = "60px grotesk";
            }

            if (rankPos === 1) {
                ctx.drawImage(rankFirst, 820, 50, 70, 70);
            } else if (rankPos === 2) {
                ctx.drawImage(rankSecond, 820, 50, 70, 70);
            } else if (rankPos === 3) {
                ctx.drawImage(rankThird, 820, 50, 70, 70);
            } else {
                ctx.font = "55px grotesk";
                ctx.fillStyle = "#44eaff";
                ctx.textAlign = "right";
                ctx.fillText(`#${rankPos}`, canvas.width / 1.05, canvas.height / 2.8);
            }

            // draw a circle to crop our avatar into
            ctx.beginPath();
            ctx.arc(140, 140, 80, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();

            // get a small res version of the user's avatar and draw it onto the canvas
            const avatarURL = target?.user.displayAvatarURL() + "?size=64";
            const avatar = await Canvas.loadImage(avatarURL.replace('webp', 'png'));
            ctx.drawImage(avatar, 60, 60, 160, 160);

            const attachment = new AttachmentBuilder(canvas.toBuffer(), "profile-image.png");

            interaction.editReply({
                files: [attachment]
            })
        }
    }
};