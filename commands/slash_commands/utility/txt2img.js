const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const SightengineClient = require('../../../node_modules/nudity-filter/sightengine');
const { Buffer } = require('node:buffer');
const Canvas = require("canvas");
const { v4: uuidv4 } = require('uuid');
const fetch = require('node-fetch');
const fs = require('fs');
const WebSocket = require('ws');
const wait = require("timers/promises").setTimeout;
const path = require('path');

function randomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function notifyError(interaction, member, err) {
    console.error(`${path.basename(__filename)} - ${err}`);
    return interaction.editReply({
        content: `${member} ${err}, please try again`,
    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err)).then(int => {
        setTimeout(() => {
            int.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting an interaction: `, err))
        }, 7000);
    });
}

loading = false;

module.exports = {
    name: `txt2img`,
    description: `Get an AI generated image from a text prompt`,
    cooldown: 15,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: "prompt",
        description: "Get fancy with it, be specific or just try something totally crazy",
        type: ApplicationCommandOptionType.String,
        required: true
    }, {
        name: "resolution",
        description: "Choose a resolution for your image",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [{ name: 'Default [512x512]', value: 'default' },
        { name: 'FHD 16:9 [1920x1080]', value: '&input_width=1920&input_height=1080' },
        { name: 'QHD 16:9 [2560x1440]', value: '&input_width=2560&input_height=1440' },
        { name: 'UHD 4K 16:9 [3840x2160]', value: '&input_width=3840&input_height=2160' },
        { name: 'FHD 9:16 [1080x1920]', value: '&input_width=1080&input_height=1920' },
        { name: 'QHD 9:16 [1440x2560]', value: '&input_width=1440&input_height=2560' },
        { name: 'UHD 4K 9:16 [2160x3840]', value: '&input_width=2160&input_height=3840' }]
    }, {
        name: "count",
        description: "Batch generate up to 4 images per prompt",
        type: ApplicationCommandOptionType.Number,
        required: false,
        choices: [{ name: '1', value: '1' },
        { name: '2', value: '2' },
        { name: '3', value: '3' },
        { name: '4', value: '4' }]
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { options, member } = interaction;
        const prompt = options.getString(`prompt`);
        const count = options.getNumber(`count`);
        const resolution = options.getString('resolution');
        const cleanPrompt = prompt.slice(0, 36).replace(/[^\w\s]/gi, '');
        const fileName = cleanPrompt.replace(/\s/g, '_');
        const timerStart = new Date();

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('delete-image')
                    .setLabel('Delete My Image')
                    .setStyle(ButtonStyle.Danger)
            );

        await interaction.deferReply();

        const filter = ['naked', 'boobs', 'vagina', 'penis', 'breasts', 'nude', 'porn', 'tits', 'cock', 'dick', 'fucking', 'cunt', 'pussy', 'piss', 'shit', 'dick', 'sex', 'anus', 'seduce', 'seductive'];

        for (let i in filter) {
            const regex = new RegExp(`\\b${filter[i]}\\b`, 'gi');
            if (regex.test(prompt)) {
                return interaction.editReply({
                    content: `**Prompt**: \`${prompt.replaceAll('`', '').slice(0, 1800)}\`
Please keep your prompts SFW *(safe for work)*. Using inappropriate promps will result in timeouts or bans without warning`,
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
            }
        }

        if (count && resolution !== 'default') {
            return interaction.editReply({
                content: `${member} The count option is only available when using the default custom resolution`,
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err)).then(int => {
                setTimeout(() => {
                    int.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting an interaction: `, err))
                }, 7000);
            });
        }

        if (loading) {
            interaction.editReply({
                content: `${member} your prompt has been added to the queue`,
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err))
            await wait(2000);
        }

        interaction.editReply({
            content: `${member} Tiny little worker robots are creating your image, it may take up to 30 seconds`,
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

        loading = true;
        // If using a custom resolution
        if (resolution !== 'default') {
            const url = process.env.AI_GEN1 + prompt + resolution + `&input_seed=${randomNum(100000000, 3000000000)}` + process.env.AI_GEN2 + uuidv4();
            const imgUrl = await generateCustomResImage(interaction, member, url);
            if (!imgUrl) return;
            const img = new AttachmentBuilder(imgUrl, { name: `${fileName}_${uuidv4()}.jpg` });
            const responseContent = `**Prompt**: \`${prompt.replaceAll('`', '').slice(0, 1800)}\` \n**Author**: ${member} \n**Completed In**: ${Math.max((new Date - timerStart) / 1000).toFixed(1)}s \n\nCreate your own AI generated image with the </txt2img:${interaction.commandId}> command`;
            const int = await interaction.editReply({
                content: responseContent,
                files: [img],
                components: [buttons]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
            loading = false;
            return nsfwCheck(interaction, int, prompt, member);
        }

        ws = new WebSocket('wss://runwayml-stable-diffusion-v1-5.hf.space/queue/join');

        // Connect to SD websocket
        ws.on('open', async function () {
            if (ws.readyState === 1) loading = false;
            if (ws.readyState !== 1) return notifyError(interaction, member, 'readyState error');
            const body = { session_hash: "xhx1zj7bng", fn_index: 1 };
            ws.send(JSON.stringify(body));
        });

        ws.on('message', async function message(data) {
            if (data.includes('send_data')) {
                if (ws.readyState !== 1) return notifyError(interaction, member, 'readyState error');
                const body = { "fn_index": 1, "data": [`${prompt}`] };
                ws.send(JSON.stringify(body));
            }

            if (data.includes('process_completed')) {
                const jsonData = JSON.parse(data.toString());
                if (jsonData.output.error) return notifyError(interaction, member, 'could not parse json data');
                if (!jsonData.output.data) return notifyError(interaction, member, 'an image could not be generated');

                let imgBaseArr = [];
                jsonData.output.data[0].forEach(img => {
                    const replace = img.replace(/(\r\n|\n|\r)/gm, '');
                    imgBaseArr.push({ data: replace.split(",")[1], name: `${fileName}_${uuidv4()}.png` });
                });

                const responseContent = `**Prompt**: \`${prompt.replaceAll('`', '').slice(0, 1800)}\` \n**Author**: ${member} \n**Completed In**: ${Math.max((new Date - timerStart) / 1000).toFixed(1)}s \n\nCreate your own AI generated image with the </txt2img:${interaction.commandId}> command`;

                if (count > 1) createCanvas(interaction, count, imgBaseArr, fileName, responseContent, buttons, prompt, member);
                if (!count || count === 1) {
                    if (!imgBaseArr[0]?.data) return notifyError(interaction, member, 'an image could not be generated');
                    const buf = Buffer.from(imgBaseArr[0].data, 'base64');
                    const imgOne = new AttachmentBuilder(buf, { name: `${fileName}_${uuidv4()}.png` });
                    const int = await interaction.editReply({
                        content: responseContent,
                        files: [imgOne],
                        components: [buttons]
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    nsfwCheck(interaction, int, prompt, member);
                }
            }
        });
    }
}

async function createCanvas(interaction, count, imgBaseArr, fileName, responseContent, buttons, prompt, member) {
    if (count === null) return notifyError(interaction, member, 'an image could not be generated');
    if (count === 2) {
        if (imgBaseArr.length < 2) {
            const count = null;
            interaction.editReply({
                content: `${member} Not enough results - trying again with count: ${count}`,
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
            return createCanvas(interaction, count, imgBaseArr, fileName, responseContent, buttons, prompt, member);
        }
        const filePath = `./res/temp/${uuidv4()}.png`;
        const filePath2 = `./res/temp/${uuidv4()}.png`;
        fs.writeFile(filePath, imgBaseArr[0].data, 'base64', async function () {
            fs.writeFile(filePath2, imgBaseArr[1].data, 'base64', async function () {
                // Create canvas based on image count
                const canvas = Canvas.createCanvas(1054, 532);
                ctx = canvas.getContext("2d");

                const img = await Canvas.loadImage(filePath);
                ctx.drawImage(img, 10, 10, 512, 512);
                const img2 = await Canvas.loadImage(filePath2);
                ctx.drawImage(img2, 532, 10, 512, 512);

                const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: `${fileName}_${uuidv4()}.png` });

                const int = await interaction.editReply({
                    content: responseContent,
                    files: [attachment],
                    components: [buttons]
                }).catch(err => console.error(`${path.basename(__filename)} There was a sending an interaction: `, err));

                nsfwCheck(interaction, int, prompt, member);

                fs.unlink(filePath, (err) => { if (err) console.log(err); });
                fs.unlink(filePath2, (err) => { if (err) console.log(err); });
            });
        });
    }
    if (count === 3) {
        if (imgBaseArr.length < 3) {
            const count = 2;
            interaction.editReply({
                content: `${member} Not enough results - trying again with count: ${count}`,
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
            return createCanvas(interaction, count, imgBaseArr, fileName, responseContent, buttons, prompt, member);
        }
        const filePath = `./res/temp/${uuidv4()}.png`;
        const filePath2 = `./res/temp/${uuidv4()}.png`;
        const filePath3 = `./res/temp/${uuidv4()}.png`;
        fs.writeFile(filePath, imgBaseArr[0].data, 'base64', async function () {
            fs.writeFile(filePath2, imgBaseArr[1].data, 'base64', async function () {
                fs.writeFile(filePath3, imgBaseArr[2].data, 'base64', async function () {
                    // Create canvas based on image count
                    const canvas = Canvas.createCanvas(1054, 1054);
                    ctx = canvas.getContext("2d");

                    const img = await Canvas.loadImage(filePath);
                    ctx.drawImage(img, 10, 10, 512, 512);
                    const img2 = await Canvas.loadImage(filePath2);
                    ctx.drawImage(img2, 532, 10, 512, 512);
                    const img3 = await Canvas.loadImage(filePath3);
                    ctx.drawImage(img3, 10, 532, 512, 512);

                    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: `${fileName}_${uuidv4()}.png` });

                    const int = await interaction.editReply({
                        content: responseContent,
                        files: [attachment],
                        components: [buttons]
                    }).catch(err => console.error(`${path.basename(__filename)} There was a sending an interaction: `, err));

                    nsfwCheck(interaction, int, prompt, member);

                    fs.unlink(filePath, (err) => { if (err) console.log(err); });
                    fs.unlink(filePath2, (err) => { if (err) console.log(err); });
                    fs.unlink(filePath3, (err) => { if (err) console.log(err); });
                });
            });
        });
    }
    if (count === 4) {
        if (imgBaseArr.length !== 4) {
            const count = 3;
            interaction.editReply({
                content: `${member} Not enough results - trying again with count: ${count}`,
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
            return createCanvas(interaction, count, imgBaseArr, fileName, responseContent, buttons, prompt, member);
        }
        const filePath = `./res/temp/${uuidv4()}.png`;
        const filePath2 = `./res/temp/${uuidv4()}.png`;
        const filePath3 = `./res/temp/${uuidv4()}.png`;
        const filePath4 = `./res/temp/${uuidv4()}.png`;
        fs.writeFile(filePath, imgBaseArr[0].data, 'base64', async function () {
            fs.writeFile(filePath2, imgBaseArr[1].data, 'base64', async function () {
                fs.writeFile(filePath3, imgBaseArr[2].data, 'base64', async function () {
                    fs.writeFile(filePath4, imgBaseArr[3].data, 'base64', async function () {
                        // Create canvas based on image count
                        const canvas = Canvas.createCanvas(1054, 1054);
                        ctx = canvas.getContext("2d");

                        const img = await Canvas.loadImage(filePath);
                        ctx.drawImage(img, 10, 10, 512, 512);
                        const img2 = await Canvas.loadImage(filePath2);
                        ctx.drawImage(img2, 532, 10, 512, 512);
                        const img3 = await Canvas.loadImage(filePath3);
                        ctx.drawImage(img3, 10, 532, 512, 512);
                        const img4 = await Canvas.loadImage(filePath4);
                        ctx.drawImage(img4, 532, 532, 512, 512);

                        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: `${fileName}_${uuidv4()}.png` });

                        const int = await interaction.editReply({
                            content: responseContent,
                            files: [attachment],
                            components: [buttons]
                        }).catch(err => console.error(`${path.basename(__filename)} There was a sending an interaction: `, err));

                        nsfwCheck(interaction, int, prompt, member);

                        fs.unlink(filePath, (err) => { if (err) console.log(err); });
                        fs.unlink(filePath2, (err) => { if (err) console.log(err); });
                        fs.unlink(filePath3, (err) => { if (err) console.log(err); });
                        fs.unlink(filePath4, (err) => { if (err) console.log(err); });
                    });
                });
            });
        });
    }
}

async function generateCustomResImage(interaction, member, url) {
    const resolve = await fetch(url)
        .catch(() => {
            interaction.editReply({
                content: `${member} There was an error generating your prompt, please try again`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err)).then(int => {
                setTimeout(() => {
                    int.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting an interaction: `, err))
                }, 7000);
            });
        });
    if (!resolve) await generateCustomResImage(interaction, member, url);
    if (resolve && resolve.status !== 200) {
        interaction.editReply({
            content: `${member} There was an error generating your prompt, please try again`
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err)).then(int => {
            setTimeout(() => {
                int.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting an interaction: `, err))
            }, 7000);
        });
        return null;
    }
    if (resolve) return resolve.url;
}

async function nsfwCheck(interaction, int, prompt, member) {
    if (!int?.attachments) return;
    const imgUrl = int.attachments.first().url;
    var Sightengine = new SightengineClient(process.env.SE_USER, process.env.SE_TOKEN);
    Sightengine.checkNudityForURL(imgUrl, function (error, result) {
        if (result.safe < 0.30) {
            if (result.partial_tag === 'chest') return;
            interaction.editReply({
                content: `**Prompt**: \`${prompt.replaceAll('`', '').slice(0, 1800)}\`
**Author**: ${member}

Image deleted as it was flagged for potential NSFW content - { raw: ${result.raw}, safe: ${result.safe}, partial: ${result.partial}, tag: ${result.partial_tag} }`,
                files: [],
                components: []
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }
    });
}