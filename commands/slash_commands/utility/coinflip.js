const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { dbCreate, dbFindOne, sendResponse, dbUpdateOne, dbDeleteOne } = require('../../../utils/utils');
const coinflipSchema = require('../../../schemas/games/coinflip_schema');
const tokensSchema = require('../../../schemas/misc/tokens_schema');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

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
            type: ApplicationCommandOptionType.Number,
            required: true
        }]
    },
    {
        name: `cancel`,
        description: `Cancel your current coinflip`,
        type: ApplicationCommandOptionType.Subcommand
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { member, options, channel } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        // Create a new coinflip game
        switch (options.getSubcommand()) {
            case 'create': {
                const amountToWager = options.getString('amount');
                const gameCode = uuidv4().split('-')[0];
                // Amount to wager must be greater than 10
                if (amountToWager < 10) return sendResponse(interaction, `${process.env.BOT_DENY} Wager amount must be **10** tokens or more`);
                // Check if the user has enough tokens to create the wager
                const checkUserTokens = await dbFindOne(tokensSchema, { userId: member.id });
                if (checkUserTokens.tokens < amountToWager)
                    return sendResponse(interaction, `${process.env.BOT_DENY} You don't have enough tokens to create this wager, your current tokens balance is **${checkUserTokens.tokens}**`);
                // Decuct the wagered tokens now so the user can't spend them before the game is finished
                await dbUpdateOne(tokensSchema, { userId: member.id }, { tokens: checkUserTokens.tokens - amountToWager });
                // Create a database entry for the new coinflip game
                await dbCreate(coinflipSchema, { code: gameCode, amount: amountToWager, playerOne: member.id });
                // Send the new game creation message to the coinflip channel
                const btn = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`coinflip-${gameCode}`)
                            .setLabel('Accept')
                            .setStyle(ButtonStyle.Primary)
                    );
                await channel.send({
                    content: `<:perk_eight:1061805558283391016> ${member} is wagering **${amountToWager}** of their finest tokens. Click **Accept** to go head-to-head`,
                    components: [btn]
                }).catch(err => console.error(err));
                interaction.deleteReply().catch(err => console.error(err));
            }
        }

        // Allow a user to cancel their pending conflip
        switch (options.getSubcommand()) {
            case 'cancel': {
                // Get the game data from the database
                const coinflipGame = await dbFindOne(coinflipSchema, { playerOne: member.id });
                if (!coinflipGame) return sendResponse(interaction, `${process.env.BOT_DENY} You don't have an active coinflip to cancel`);
                // Make sure the game isn't in progress
                if (coinflipGame.inProgress === true) return sendResponse(interaction, `${process.env.BOT_DENY} Someone has already joined this wager so it can't be cancelled`);
                await dbDeleteOne(coinflipSchema, { playerOne: member.id });
                // Refund the users tokens
                const checkUserTokens = await dbFindOne(tokensSchema, { userId: member.id });
                await dbUpdateOne(tokensSchema, { userId: member.id }, { tokens: checkUserTokens.tokens + coinflipGame.amount });
                // Find and delete the game initiation message
                const fetchGameMessages = (await channel.messages.fetch({ limit: 20 }))
                    .filter(m => m.author.bot && m.content.includes(`${member} is wagering`)).first();
                if (fetchGameMessages) await fetchGameMessages.edit({
                    content: `${member} chickened out and cancelled their wager of **${coinflipGame.amount}** tokens`,
                    components: []
                }).catch(err => console.error(err));
                sendResponse(interaction, `${process.env.BOT_CONF} Your coinflip has been cancelled and **${coinflipGame.amount}** tokens have been refunded`);
            }
        }
    }
}