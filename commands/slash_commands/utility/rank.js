const { ContextMenuInteraction, MessageAttachment } = require('discord.js');
const mongo = require('../../../mongo');
const rankSchema = require('../../../schemas/rank-schema');
const Canvas = require('canvas');
const path = require('path');

module.exports = {
    name: `rank`,
    description: `Fetch your, or someone else's rank`,
    permission: ``,
    cooldown: 60,
    type: `CHAT_INPUT`,
    usage: `/rank`,
    options: [{
        name: `username`,
        description: `The user whos rank you want to fetch. Leave black to fetch your own`,
        type: `USER`,
        required: false,
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { guild, channel, member, options } = interaction;

        const botChan = guild.channels.cache.get(process.env.BOT_CHAN)

        // if (channel.id !== process.env.BOT_CHAN && member.id !== process.env.OWNER_ID) {
        //     return interaction.reply({
        //         content: `${process.env.BOT_DENY} \`You can only use this command in #${botChan.name}\``,
        //         ephemeral: true
        //     })
        // }

        interaction.deferReply();

        const target = options.getMember('username') || member;
        const targetId = target?.user?.id || member?.id;

        await mongo().then(async mongoose => {
            try {
                const results = await rankSchema.find({ id: targetId })

                for (const info of results) {
                    let { id, username, discrim, rank, level, msgCount, xp, xxp, xxxp } = info;

                    const rankPos = parseInt(rank);

                    // create our canvas
                    const canvas = Canvas.createCanvas(930, 280);
                    const ctx = canvas.getContext('2d');

                    // default background
                    let background = await Canvas.loadImage('https://www.weebly.com/editor/uploads/1/2/6/0/126006118/custom_themes/656977109613806662/files/images/rankbg.png');
                    // custom background per user
                    if (id === '438434841617367080') background = await Canvas.loadImage('https://www.weebly.com/editor/uploads/1/2/6/0/126006118/custom_themes/656977109613806662/files/images/rankraging.png');
                    if (id === '707488396695699528') background = await Canvas.loadImage('https://cdn.discordapp.com/attachments/820907130378518539/899576398488948777/sccjonjorank.png');

                    // stretch background to the size of the canvas
                    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                    
                    // draw an opaque rectangle ontop of image
                    ctx.fillStyle = 'rgba(0,0,0,0.5)';
                    ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);

                    // draw a rectangle the same size as the canvas
                    ctx.strokeStyle = '#ffffff';
                    ctx.strokeRect(0, 0, canvas.width, canvas.height);

                    // try to compensate for long usernames
                    ctx.font = '45px sans-serif';
                    let userDiscrim = username + '#' + discrim;
                    if (userDiscrim.length > 20) ctx.font = '35px sans-serif';
                    if (userDiscrim.length > 30) ctx.font = '30px sans-serif', userDiscrim = userDiscrim.slice(0, 25) + '...';
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText(userDiscrim, canvas.width / 3.8, canvas.height / 2.8);

                    // not the same as rankPos, this is technically 'level' but we call it 'rank' as it coincides with our rank roles
                    ctx.font = '40px sans-serif';
                    ctx.fillStyle = '#44eaff';
                    ctx.fillText(`Rank ${level}`, canvas.width / 3.8, canvas.height / 1.6);

                    // k formatter for numbers greater than 999
                    const xpMath = xxxp - xxp

                    function kFormatter(num) {
                        return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000 * 1).toFixed(1)) + 'K' : Math.sign(num) * Math.abs(num)
                    }

                    let xp1 = kFormatter(xpMath);
                    let xp2 = kFormatter(xxxp);
                    let xp3 = kFormatter(xxp)
                    let count = kFormatter(msgCount);

                    // message count
                    ctx.font = '26px sans-serif';
                    ctx.fillStyle = '#ffffff';
                    ctx.textAlign = 'right';
                    ctx.fillText(`Message Count: ${count}`, canvas.width / 1.16, canvas.height / 1.6);

                    // draw and fill our xp bar
                    const colors = [0x00E2FF, 0x00FF85];
                    const randomColorNo = Math.floor(Math.random() * colors.length);
                    const randomColor = colors[randomColorNo];
                    const percentage = Math.floor((xxp / xxxp) * 100);
                    const roundedPercent = Math.round(percentage);

                    const testPerc = 100
                    for (i = 0; i < testPerc; i++) {
                        ctx.beginPath()
                        ctx.lineWidth = 14
                        ctx.strokeStyle = '#484B4E'
                        ctx.fillStyle = '#484B4E'
                        ctx.arc(260 + (i * 5.32), 205, 8, 0, Math.PI * 2, true)
                        ctx.stroke()
                        ctx.fill()
                    }

                    var i;
                    for (i = 0; i < roundedPercent; i++) {
                        ctx.beginPath()
                        ctx.lineWidth = 14
                        ctx.strokeStyle = '#44eaff'
                        ctx.fillStyle = '#44eaff'
                        ctx.arc(260 + (i * 5.32), 205, 5.5, 0, Math.PI * 2, true)
                        ctx.stroke()
                        ctx.fill()
                    }

                    // current xp and xp needed
                    ctx.font = '24px sans-serif';
                    ctx.fillStyle = '#000000';
                    ctx.fillText(`${xp3} / ${xp2} XP`, canvas.width / 1.525, canvas.height / 1.31);

                    // position in the leadboard
                    ctx.font = '60px sans-serif';
                    if (rankPos.length >= 3) ctx.font = '50px sans-serif';
                    if (rankPos.length >= 5) ctx.font = '45px sans-serif';
                    if (rankPos === 1) {
                        ctx.fillStyle = '#FFD700';
                        ctx.textAlign = 'right';
                        ctx.fillText(`🥇`, canvas.width / 1.05, canvas.height / 2.8);
                    } else if (rankPos === 2) {
                        ctx.fillStyle = '#C0C0C0';
                        ctx.textAlign = 'right';
                        ctx.fillText(`🥈`, canvas.width / 1.05, canvas.height / 2.8);
                    } else if (rankPos === 3) {
                        ctx.fillStyle = '#CD7F32';
                        ctx.textAlign = 'right';
                        ctx.fillText(`🥉`, canvas.width / 1.05, canvas.height / 2.8);
                    } else {
                        ctx.font = '55px sans-serif';
                        ctx.fillStyle = '#44eaff';
                        ctx.textAlign = 'right';
                        ctx.fillText(`#${rankPos}`, canvas.width / 1.05, canvas.height / 2.8);
                    }

                    // draw a circle to crop our avatar into
                    ctx.beginPath();
                    ctx.arc(140, 140, 80, 0, Math.PI * 2, true);
                    ctx.closePath();
                    ctx.clip();

                    const avatar = await Canvas.loadImage(target?.user.displayAvatarURL({ format: 'png' }));
                    ctx.drawImage(avatar, 60, 60, 160, 160);

                    const attachment = new MessageAttachment(canvas.toBuffer(), 'profile-image.png');

                    interaction.editReply({
                        files: [attachment]
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                }
            } finally {
                // do nothing
            }
        });
    }
}