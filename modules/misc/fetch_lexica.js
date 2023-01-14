const cronjob = require('cron').CronJob;
const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
const wait = require("timers/promises").setTimeout;

/**
 * Delete the interaction if the image is NSFW
 * @param {CommandInteraction} interaction The interaction object to be edited
 * @param {Message} int The message to be checked
 * @param {string} prompt The prompt sent by the user
 * @param {GuildMember} member The member that initiated the command
 */
async function nsfwCheck(message) {
    try {
        // Return if the interaction does not contain any attachments
        if (!message?.attachments) return;
        // Get the URL of the image
        const imgUrl = message.attachments.first().url;
        // Initialize SightengineClient
        var Sightengine = new SightengineClient(process.env.SE_USER, process.env.SE_TOKEN);
        // Check if the image is NSFW
        Sightengine.checkNudityForURL(imgUrl, function (error, result) {
            // Edit the interaction if the image is deemed NSFW
            if (result.safe < 0.30) {
                if (result.partial_tag === 'chest') return;
                message?.delete();
            }
        });
    } catch {
        console.error('There was a problem performing a NSFW check')
    }
}

module.exports = async (client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const aiChan = guild.channels.cache.get(process.env.AI_CHAN);

    // Fetch images from lexica.art and send them to a channel
    const redditFetch = new cronjob('*/10 * * * *', async function () {
        try {
            (async () => {
                const browser = await puppeteer.launch().catch(() => {});
                const page = await browser.newPage().catch(() => {});
                await page.goto('https://lexica.art', { waitUntil: 'networkidle2' }).catch(() => {});
                // Wait for some images to be loaded
                await wait(10000);
                // Get the first image URL
                let imageUrl = await page.evaluate(() => {
                    let firstImage = document.querySelector('img');
                    return firstImage.src;
                }).catch(() => {});
                // Fetch the image URL and get an image buffer
                fetch(imageUrl)
                    .then(response => response.arrayBuffer())
                    .then(async arrayBuffer => {
                        const buffer = Buffer.from(arrayBuffer);
                        const message = await aiChan.send({
                            files: [buffer]
                        });
                        nsfwCheck(message);
                    }).catch(() => {});
            })();
        } catch {
            // I don't care enough to log this
        }
    });
    redditFetch.start();
}