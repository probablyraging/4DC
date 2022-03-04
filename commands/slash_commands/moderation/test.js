const { ContextMenuInteraction, MessageEmbed } = require('discord.js');
const puppeteer = require("puppeteer");
const sleep = require("timers/promises").setTimeout;
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
        const { } = interaction;

        interaction.deferReply()

        // Fetch the drawing from the website
        let websiteUrl = `https://aggie.io/testroom`;
        const browser = await puppeteer.launch()
        const page = await browser.newPage()

        // Set our viewport
        await page.setViewport({
            width: 2160,
            height: 1080
        })

        await page.goto(websiteUrl, {
            waitUntil: 'networkidle0'
        });

        await sleep(1000)

        page.mouse.click(1880, 570)
        page.mouse.click(1890, 570)
        page.mouse.click(2010, 570)
        page.mouse.click(2020, 570)
        page.mouse.click(2030, 570)
        page.mouse.click(2040, 570)



        // Get the image as a base64 string, so we don't need to save it locally
        let baseURL;
        await page.screenshot({
            encoding: "base64",
            // clip: {
            //     x: 35,
            //     y: 40,
            //     width: 1880,
            //     height: 1065
            // }
        }).then(async imageBase64 => {

            const dgEmbed = new MessageEmbed()

            // upload the local drawing file to IMGUR and then upload it to the Sketch Guess channel
            const { ImgurClient } = require('imgur');
            const imgur = new ImgurClient({ clientId: process.env.IMGUR_ID, clientSecret: process.env.IMGUR_SECRET });

            const response = await imgur.upload({
                image: imageBase64,
                type: 'base64',
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem uploading an image to imgur: `, err));

            let imgurUrl;
            response.forEach(res => {
                imgurUrl = res.data.link
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