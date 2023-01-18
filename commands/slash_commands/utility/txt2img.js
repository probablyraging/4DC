const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { sendResponse } = require('../../../utils/utils');
const SightengineClient = require('../../../node_modules/nudity-filter/sightengine');
const { Buffer } = require('node:buffer');
const Canvas = require("canvas");
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const WebSocket = require('ws');
const wait = require("timers/promises").setTimeout;
const path = require('path');

let loading = false;

/**
 * Create a canvas and draw images onto it
 * @param {CommandInteraction} interaction The interaction object
 * @param {GuildMember} member The member that initiated the command
 * @param {string} prompt The prompt sent by the user
 * @param {number} count The number of images to draw on the canvas
 * @param {string} fileName The name of the file to be created
 * @param {Date} timerStart The time at which the command was ran
 * @param {Array} buttons An array of buttons
 */
async function initiateGeneration(interaction, member, prompt, count, fileName, timerStart, buttons) {
    setTimeout(() => {
        // Wait 30 seconds and check if the interaction has been replied to, if not, initiate generation again
        interaction?.fetchReply('@original').then(reply => {
            if (!reply.content.toLowerCase().includes('completed')) {
                return sendResponse(interaction, `${member} An image was unable to be generated, please try again`);
            }
        }).catch(err => console.error('There was a problem fetching an interaction in txt2img: ', err));
    }, 30000);

    // Open a websocket connection with a server
    ws = new WebSocket(process.env.AI_WSS);

    ws.on('open', async function () {
        // Check if the websocket is ready, notify the user if there is an error
        if (ws.readyState !== 1) return;
        // Send a websocket request
        const body = { session_hash: "xhx1zj7bng", fn_index: 1 };
        ws.send(JSON.stringify(body));
    });

    ws.on('message', async function message(data) {
        // If the response contains "send_data" send the user's prompt back
        if (data.includes('send_data')) {
            // Check if the websocket is ready, notify the user if there is an error
            if (ws.readyState !== 1) return sendResponse(interaction, `${member} No image was able to be generated`);
            const body = { "fn_index": 1, "data": [`${prompt}`] };
            ws.send(JSON.stringify(body));
        }
        // If the response contains "process_completed" get the output data that contains the image data
        if (data.includes('process_completed')) {
            const jsonData = JSON.parse(data.toString());
            // If there is no data in the parsed data, return an error
            if (jsonData.output.error) return sendResponse(interaction, `${member} No image was able to be generated`);
            if (!jsonData.output.data) return sendResponse(interaction, `${member} No image was able to be generated`);

            // Get the image data abd add it to the imgBaseArr
            let imgBaseArr = [];
            jsonData.output.data[0].forEach(img => {
                const replace = img.replace(/(\r\n|\n|\r)/gm, '');
                imgBaseArr.push({ data: replace.split(",")[1], name: `${fileName}_${uuidv4()}.png` });
            });

            const responseContent = `**Prompt**: \`${prompt.replaceAll('`', '').slice(0, 1800)}\` \n**Author**: ${member} \n**Completed In**: ${Math.max((new Date - timerStart) / 1000).toFixed(1)}s \n\nCreate your own AI generated image with the </txt2img:${interaction.commandId}> command`;
            // If count is greater than 1, create a canvas for the images
            if (count > 1) createCanvas(interaction, count, imgBaseArr, fileName, responseContent, buttons, prompt, member);
            // Create an attachment from the single image, send it and perform a NSFW check
            if (!count || count === 1) {
                if (!imgBaseArr[0]?.data) return sendResponse(interaction, `${member} No image was able to be generated`);
                const buf = Buffer.from(imgBaseArr[0].data, 'base64');
                const imgOne = new AttachmentBuilder(buf, { name: `${fileName}_${uuidv4()}.png` });
                const int = await sendResponse(interaction, responseContent, [], [imgOne], [buttons]);
                nsfwCheck(interaction, int, prompt, member);
            }
            loading = false;
        }
    });
}

/**
 * Create a canvas and draw images onto it
 * @param {CommandInteraction} interaction The interaction object
 * @param {number} count The number of images to draw on the canvas
 * @param {Array} imgBaseArr An array of image objects with the properties data (the image data as a base64 string) and url (the image URL)
 * @param {string} fileName The name of the file to be created
 * @param {string} responseContent The content of the response message
 * @param {Array} buttons An array of buttons
 * @param {string} prompt The prompt sent by the user
 * @param {GuildMember} member The member that initiated the command
 */
async function createCanvas(interaction, count, imgBaseArr, fileName, responseContent, buttons, prompt, member) {
    // Return if there was an error generating an image
    try {
        // Create an array to store file paths for each image
        let filePaths = [];
        for (let i = 0; i < count; i++) {
            filePaths.push(`./res/temp/${uuidv4()}.png`);
        }
        // Write each image to a file and store the file path in the filePaths array
        let numNonUndefinedImages = 0;
        for (let i = 0; i < count; i++) {
            if (imgBaseArr[i]?.data == undefined) continue;
            fs.writeFile(filePaths[i], imgBaseArr[i]?.data, 'base64', async function () {
                numNonUndefinedImages++;
                if (i === count - 1) {
                    // Determine canvas dimensions based on the number of non-undefined images
                    let canvasWidth, canvasHeight;
                    if (numNonUndefinedImages === 2) {
                        canvasWidth = 1054;
                        canvasHeight = 532;
                    } else {
                        canvasWidth = 1054;
                        canvasHeight = 1054;
                    }
                    // Create canvas
                    const canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
                    const ctx = canvas.getContext("2d");
                    // Draw each non-undefined image on to the canvas
                    let k = 0;
                    for (let j = 0; j < count; j++) {
                        if (imgBaseArr[j]?.data == undefined) continue;
                        const img = await Canvas.loadImage(filePaths[j]);
                        if (numNonUndefinedImages === 2) {
                            ctx.drawImage(img, 10 + (522 * k), 10, 512, 512);
                        } else {
                            ctx.drawImage(img, 10 + (522 * (k % 2)), 10 + (522 * Math.floor(k / 2)), 512, 512);
                        }
                        k++;
                    }
                    // If there are no viable images
                    if (numNonUndefinedImages === 0) {
                        sendResponse(interaction, `${member} No image was able to be generated`);
                        // Delete all the image files
                        for (let j = 0; j < count; j++) {
                            fs.unlink(filePaths[j], (err) => { if (err) console.log(err); });
                        }
                        return;
                    }
                    // Create attachment from canvas and send it
                    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: `${fileName}_${uuidv4()}.png` });
                    const int = await sendResponse(interaction, responseContent, [], [attachment], [buttons]);
                    // Peform a NSFW check on the attachment
                    nsfwCheck(interaction, int, prompt, member);
                    // Delete all the image files
                    for (let j = 0; j < count; j++) {
                        fs.unlink(filePaths[j], (err) => { if (err) console.log(err); });
                    }
                }
            });
        }
    } catch (err) {
        return sendResponse(interaction, `${member} an error occured while generating your images`)
    }
}

/**
 * Delete the interaction if the image is NSFW
 * @param {CommandInteraction} interaction The interaction object to be edited
 * @param {Message} int The message to be checked
 * @param {string} prompt The prompt sent by the user
 * @param {GuildMember} member The member that initiated the command
 */
async function nsfwCheck(interaction, int, prompt, member) {
    // Return if the interaction does not contain any attachments
    if (!int?.attachments) return;
    // Get the URL of the image
    const imgUrl = int.attachments.first().url;
    // Initialize SightengineClient
    var Sightengine = new SightengineClient(process.env.SE_USER, process.env.SE_TOKEN);
    // Check if the image is NSFW
    Sightengine.checkNudityForURL(imgUrl, function (error, result) {
        // Edit the interaction if the image is deemed NSFW
        if (result.safe < 0.30) {
            if (result.partial_tag === 'chest') return;
            sendResponse(interaction, `**Prompt**: \`${prompt.replaceAll('`', '').slice(0, 1800)}\`
**Author**: ${member}

Image deleted as it was flagged for potential NSFW content - { raw: ${result.raw}, safe: ${result.safe}, partial: ${result.partial}, tag: ${result.partial_tag} }`, [], [], []);
        }
    });
}

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
        name: "count",
        description: "Batch generate up to 4 images per prompt",
        type: ApplicationCommandOptionType.Number,
        required: true,
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

        await interaction.deferReply().catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        // Delay creating new websocket if there is a prompt still loading
        if (loading) {
            sendResponse(interaction, `${member} your prompt has been added to the queue`);
            await wait(5000);
        }
        loading = true;

        await sendResponse(interaction, `${member} Tiny little worker robots are creating your image, it may take up to 30 seconds`);
        // Initiate the image generation
        initiateGeneration(interaction, member, prompt, count, fileName, timerStart, buttons);
    }
}