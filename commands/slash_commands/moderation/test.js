const { ContextMenuInteraction, MessageEmbed } = require('discord.js');
const { ImgurClient } = require('imgur');
const sleep = require("timers/promises").setTimeout;
const puppeteer = require("puppeteer");
const { v4: uuidv4 } = require("uuid");
const path = require('path');

module.exports = {
    name: `test`,
    description: `dummy command for testing stuff`,
    permission: `MANAGE_MESSAGES`,
    cooldown: 30,
    type: `CHAT_INPUT`,
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { channel } = interaction;

        interaction.deferReply();

        const customId = uuidv4().slice(0, Math.random() * (24 - 18) + 18);

        // Fetch the drawing from the website
        let websiteUrl = `https://aggie.io/d924db4d-fc33-46c4-8e`;
        const browser = await puppeteer.launch({
            headless: true,
            args: [`--window-size=1920,1080`],
            defaultViewport: {
                width: 1920,
                height: 1080
            }
        });
        const page = await browser.newPage();

        await page.goto(websiteUrl, {
            waitUntil: 'networkidle0'
        });

        // remove tooltips that obstruct the canvas
        let selector = '.tooltip';
        await page.evaluate((s) => {
            var elements = document.querySelectorAll(s);

            for (var i = 0; i < elements.length; i++) {
                elements[i].parentNode.removeChild(elements[i]);
            }
        }, selector);

        await sleep(5000);

        await page.click('button[title="Fit on screen [Home]"]')
        await sleep(500);
        await page.click('button[title="Zoom out [-]"]')
        await sleep(500);
        await page.click('button[title="Fit on screen [Home]"]')

        await sleep(5000);

        // Get the image as a base64 string, so we don't need to save it locally
        await page.screenshot({
            encoding: "base64",
            clip: {
                x: 90, // top
                y: 130, // left
                width: 1530,
                height: 865
            }
        }).then(async imageBase64 => {
            const dgEmbed = new MessageEmbed()

            // upload the local drawing file to IMGUR and then upload it to the Sketch Guess channel
            const imgur = new ImgurClient({ clientId: process.env.IMGUR_ID, clientSecret: process.env.IMGUR_SECRET });

            const response = await imgur.upload({
                image: imageBase64,
                type: 'base64',
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem uploading an image to imgur: `, err));

            let imgurUrl;
            response.forEach(res => {
                const imgurUrl = res.data.link;
                dgEmbed.setImage(imgurUrl);
            });

            interaction.editReply({
                embeds: [dgEmbed]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));
        });

        // Close browser and cleanup
        await browser.close();
    }
}