const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { dbCreate, dbFindOne } = require('../../utils/utils');
const coinflipSchema = require('../../schemas/misc/coinflip_schema');
const cronjob = require('cron').CronJob;
const { v4: uuidv4 } = require('uuid');

function randomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Creates a new free to enter coinflip game with the bot as the initiator
 * @param {Channel} coinflipChan The channel for the coinflip game to be sent to
 */
async function initCoinflip(client, coinflipChan) {
    const amountToWager = randomNum(10, 100);
    const gameCode = uuidv4().split('-')[0];
    // Check is there is still an active bot coinflip available
    const checkActiveGames = await dbFindOne(coinflipSchema, { playerOne: client.user.id });
    if (checkActiveGames) return;
    // Create a database entry for the new coinflip game
    await dbCreate(coinflipSchema, { code: gameCode, amount: amountToWager, playerOne: client.user.id });
    // Send the new game creation message to the coinflip channel
    const btn = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`coinflip-${gameCode}`)
                .setLabel('Accept')
                .setStyle(ButtonStyle.Primary)
        );
    coinflipChan.send({
        content: `<:perk_three:1061798848890142800> **FREE TO PLAY** <@${client.user.id}> is wagering **${amountToWager}** tokens. Click **Accept** to play for free`,
        components: [btn]
    }).catch(err => console.error(err));
}

module.exports = async (client) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const coinflipChan = guild.channels.cache.get(process.env.COINFLIP_CHAN);

    coinflip = new cronjob(`${randomNum(1, 59)} 0/2 * * *`, async function () {
        await initCoinflip(client, coinflipChan);
        coinflip.stop();
        coinflip.start();
    });
    coinflip.start();
};