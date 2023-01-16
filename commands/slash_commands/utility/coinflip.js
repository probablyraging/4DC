const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, AttachmentBuilder } = require('discord.js');
const { dbCreate, dbFindOne, sendResponse, dbUpdateOne, dbDeleteOne } = require('../../../utils/utils');
const coinflipSchema = require('../../../schemas/misc/coinflip_schema');
const tokensSchema = require('../../../schemas/misc/tokens_schema');
const Canvas = require("canvas");
const gifEncoder = require('gifencoder');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const wait = require("timers/promises").setTimeout;
const path = require('path');

async function initCoinflip(client, guild, channel, gameCode) {
    const results = await dbFindOne(coinflipSchema, { code: gameCode });
    const playerOne = results.playerOne;
    const playerTwo = results.playerTwo;
    const wagerAmount = results.amount

    await channel.send({ content: `<:botconfirm:845719660812435496> <@${playerTwo}> has accepted <@${playerOne}>'s wager of **${wagerAmount}** tokens. Good luck!` }).catch(err => console.error(err));
    // Get a random number, 1 = playerOne, 2 = playerTwo
    const pickWinner = randomNum(1, 2);
    if (pickWinner === 1) {
        // Get the winners current tokens count and add the wagered tokens
        const checkWinnersTokens = await dbFindOne(tokensSchema, { userId: playerOne });
        await dbUpdateOne(tokensSchema, { userId: playerOne }, { tokens: checkWinnersTokens.tokens + wagerAmount });
        // Notify players of the result
        // await channel.send({ content: `<:dollar_coin:1034396609276022854> <@${playerOne}> won the wager of **${wagerAmount}** tokens against <@${playerTwo}>!` }).catch(err => console.error(err));
        await createCanvas(client, guild, channel, playerOne, playerTwo, playerOne, wagerAmount, gameCode);
    } else {
        // Get the winners current tokens count and add the wagered tokens
        const checkWinnersTokens = await dbFindOne(tokensSchema, { userId: playerTwo });
        await dbUpdateOne(tokensSchema, { userId: playerTwo }, { tokens: checkWinnersTokens.tokens + wagerAmount });
        // Notify players of the result
        // await channel.send({ content: `<:dollar_coin:1034396609276022854> <@${playerTwo}> won the wager of **${wagerAmount}** tokens against <@${playerOne}>!` }).catch(err => console.error(err));
        await createCanvas(client, guild, channel, playerOne, playerTwo, playerTwo, wagerAmount, gameCode);
    }
    // Remove the game entry from the database
    await dbDeleteOne(coinflipSchema, { code: gameCode });
}

async function createCanvas(client, guild, channel, playerOne, playerTwo, winnerId, wagerAmount, gameCode) {
    // Fetch the winner of the coinflip
    const fetchWinner = await guild.members.fetch(winnerId).catch(err => console.error(err));
    const fileName = uuidv4();
    // Image
    const background = await Canvas.loadImage("./res/images/coinflip_winner.png");
    const canvas = Canvas.createCanvas(330, 200);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    // Position
    ctx.font = "900 20px redhatdisplay";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    // Create a GIF
    const encoder = new gifEncoder(330, 200);
    encoder.createReadStream().pipe(fs.createWriteStream(`./res/temp/${fileName}.gif`));
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(40);
    encoder.setQuality(10);
    // Add the text sliding in to the gif
    for (let y = canvas.height + 400; y > 174; y -= 10) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        ctx.fillText(fetchWinner.user.tag, 170, y);
        if (y === 180) {
            for (let i = 0; i < 100; i++) {
                encoder.addFrame(ctx);
            }
        } else {
            encoder.addFrame(ctx);
        }
    }
    encoder.finish();
    const attachment = new AttachmentBuilder(`./res/temp/${fileName}.gif`, { name: `${fileName}.gif` });
    // Send the gif as a webhook
    await channel.createWebhook({ name: client.user.username, avatar: client.user.avatarURL({ format: 'png', size: 256 }) })
        .then(webhook => {
            webhook.send({
                content: `**Game:** <@${playerOne}> vs. <@${playerTwo}> \n**Wager:** ${wagerAmount} tokens \n**Code:** ${gameCode}`,
                files: [attachment]
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err))
                .then(() => {
                    webhook.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook: `, err));
                    // Delete the GIF file
                    if (fs.existsSync(`./res/temp/${fileName}.gif`)) fs.unlink(`./res/temp/${fileName}.gif`, (err) => { if (err) console.error(err); });
                });
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err));
}

function randomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

module.exports = {
    name: `coinflip`,
    description: `Wager your tokens with another player`,
    cooldown: 5,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `create`,
        description: `Create a new coinflip`,
        type: ApplicationCommandOptionType.Subcommand,
        options: [{
            name: `amount`,
            description: `The amount of tokens to wager`,
            type: ApplicationCommandOptionType.String,
            required: true
        }]
    },
    {
        name: `join`,
        description: `Join an existing coinflip`,
        type: ApplicationCommandOptionType.Subcommand,
        options: [{
            name: `code`,
            description: `The ID of the active coinflip`,
            type: ApplicationCommandOptionType.String,
            required: true
        }]
    },
    {
        name: `cancel`,
        description: `Join an existing coinflip`,
        type: ApplicationCommandOptionType.Subcommand
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { member, options, channel, guild, client } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        // Create a new coinflip game
        switch (options.getSubcommand()) {
            case 'create': {
                const amountToWager = options.getString('amount');
                const gameCode = uuidv4().split('-')[0];
                // Amount to wager must be greater than 10
                if (amountToWager < 10) return sendResponse(interaction, `${process.env.BOT_DENY} Wager amount must be **10** tokens or more`);
                // Check is they already have an active game
                const checkActiveGames = await dbFindOne(coinflipSchema, { playerOne: member.id });
                if (checkActiveGames) return sendResponse(interaction, `${process.env.BOT_DENY} You already have an active wager. Use **/coinflip cancel** to cancel your current wager before creating a new one`);
                // Check if the user has enough tokens to create the wager
                const checkUserTokens = await dbFindOne(tokensSchema, { userId: member.id });
                if (checkUserTokens.tokens < amountToWager)
                    return sendResponse(interaction, `${process.env.BOT_DENY} You don't have enough tokens to create this wager, your current tokens balance is **${checkUserTokens.tokens}**`);
                // Decuct the wagered tokens now so the user can't spend them before the game is finished
                await dbUpdateOne(tokensSchema, { userId: member.id }, { tokens: checkUserTokens.tokens - amountToWager });
                // Create a database entry for the new coinflip game
                await dbCreate(coinflipSchema, { code: gameCode, amount: amountToWager, playerOne: member.id });
                // Send the new game creation message to the coinflip channel
                await channel.send({ content: `<:perk_nine:1061808707014504458> ${member} is wagering **${amountToWager}** of their finest tokens. Use **/coinflip join ${gameCode}** to challenge them` })
                    .catch(err => console.error(err));
                interaction.deleteReply().catch(err => console.error(err));
            }
        }

        // Join an existing coinflip game
        switch (options.getSubcommand()) {
            case 'join': {
                const gameCode = options.getString('code');
                // Don't let a user join their own game
                if (member.id === gameCode) return sendResponse(interaction, `${process.env.BOT_DENY} You can't join your own wager`);
                // Get the game data from the database
                const coinflipGame = await dbFindOne(coinflipSchema, { code: gameCode });
                // Check if the owner of the coinflip is still in the server, if not, delete their game
                const checkIfUserExists = await guild.members.fetch(coinflipGame.playerOne).catch(err => console.error(err));
                if (!checkIfUserExists) {
                    sendReply(interaction, `${process.env.BOT_DENY} This wager no longer exists`);
                    return dbDeleteOne(coinflipSchema, { code: gameCode });
                }
                // If not game with the supplied code exists
                if (!coinflipGame) return sendResponse(interaction, `${process.env.BOT_DENY} This wager has already ended`);
                if (coinflipGame?.inProgress === true) return sendResponse(interaction, `${process.env.BOT_DENY} Someone already joined this wager`);
                // Check if the user has enough tokens to wager
                const checkUserTokens = await dbFindOne(tokensSchema, { userId: member.id });
                // If the user doesn't have a tokens database entry
                if (!checkUserTokens) return sendResponse(interaction, `${process.env.BOT_DENY} You don't have enough tokens to join this wager, start earning tokens by chatting in the server`);
                // If the user doesn't have enough tokens to join the wager
                if (checkUserTokens.tokens < coinflipGame.amount)
                    return sendResponse(interaction, `${process.env.BOT_DENY} You don't have enough tokens to join this wager, your current tokens balance is ${checkUserTokens.amount}`);
                // Decuct the wagered tokens now so the user can't spend them before the game is finished
                await dbUpdateOne(tokensSchema, { userId: member.id }, { tokens: checkUserTokens.tokens - coinflipGame.amount });
                // If the game was found, set playerTwo as the challenger and start the game
                await dbUpdateOne(coinflipSchema, { code: gameCode }, { playerTwo: member.id, inProgress: true });
                initCoinflip(client, guild, channel, gameCode);
                interaction.deleteReply().catch(err => console.error(err));
            }
        }

        // Allow a user to cancel their pending conflip
        switch (options.getSubcommand()) {
            case 'cancel': {
                // Get the game data from the database
                const coinflipGame = await dbFindOne(coinflipSchema, { playerOne: member.id });
                // Make sure the game isn't in progress
                if (coinflipGame.inProgress === true) return sendResponse(interaction, `${process.env.BOT_DENY} Someone has already joined this wager so it can't be cancelled`);
                await dbDeleteOne(coinflipSchema, { playerOne: member.id });
                // Refund the users tokens
                const checkUserTokens = await dbFindOne(tokensSchema, { userId: member.id });
                await dbUpdateOne(tokensSchema, { userId: member.id }, { tokens: checkUserTokens.tokens + coinflipGame.amount });
                // Find and delete the game initiation message
                const fetchGameMessages = await channel.messages.fetch({ limit: 20 }).catch(err => console.error(err));
                fetchGameMessages.forEach(message => {
                    if (message.author.bot && message.content.includes(`join ${coinflipGame.code}`)) message.edit({ content: `${member} chickened out and cancelled their wager of **${coinflipGame.amount}** tokens` })
                        .catch(err => console.error(err));
                });
                sendResponse(interaction, `${process.env.BOT_CONF} Your coinflip has been cancelled and **${coinflipGame.amount}** tokens have been refunded`);
            }
        }
    }
}