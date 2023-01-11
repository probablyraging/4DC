const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { dbCreate, dbUpdateOne, sendResponse } = require('../../../utils/utils');
const tokensSchema = require('../../../schemas/misc/tokens_schema');
const path = require('path');

module.exports = {
    name: `tokens`,
    description: `Add or remove tokens from a user`,
    defaultMemberPermissions: ['ManageRoles'],
    cooldown: 3,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `add`,
        description: `Add tokens to a user`,
        type: ApplicationCommandOptionType.Subcommand,
        options: [{
            name: `user`,
            description: `The user you want to add tokens to`,
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: `amount`,
            description: `The amount of tokens to add`,
            type: ApplicationCommandOptionType.Number,
            required: true,
        }],
    },
    {
        name: `remove`,
        description: `Remove tokens from a user`,
        type: ApplicationCommandOptionType.Subcommand,
        options: [{
            name: `user`,
            description: `The user you want to remove tokens from`,
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: `amount`,
            description: `The amount of tokens to remove`,
            type: ApplicationCommandOptionType.Number,
            required: true,
        }],
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { guild, options, member } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const tokenLog = guild.channels.cache.get(process.env.CREDITLOG_CHAN);
        const user = options.getUser('user');
        let amount = options.getNumber('amount');

        // Avoid adding tokens to bots
        if (user.bot) return sendResponse(interaction, `${process.env.BOT_DENY} This user is a bot`);
        // Amount must always be greater than 0
        if (amount < 1) return sendResponse(interaction, `${process.env.BOT_DENY} Amount must be greater than 0`);

        switch (options.getSubcommand()) {
            // ADD
            case 'add': {
                // Fetch the user's db entry
                const results = await tokensSchema.find({ userId: user.id });
                // Check to see if the user is in our database yet, if not, add them
                if (results.length === 0) {
                    await dbCreate(tokensSchema, { userId: user.id, tokens: amount });
                    // Log when a user's tokens increase or decrease
                    tokenLog.send({
                        content: `${process.env.TOKENS_MANUAL} ${member} added **${amount}** ${amount > 1 ? 'tokens' : 'token'} to ${user}, they now have **${amount}** tokens`,
                        allowedMentions: {
                            parse: []
                        }
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                }

                for (const data of results) {
                    let { tokens } = data;
                    // Add the desired amount of tokens
                    await dbUpdateOne(tokensSchema, { userId: user.id }, { tokens: tokens + amount });
                    // Log when a user's tokens increase or decrease
                    tokenLog.send({
                        content: `${process.env.TOKENS_MANUAL} ${member} added **${amount}** ${amount > 1 ? 'tokens' : 'token'} to ${user}, they now have **${tokens + amount}** tokens`,
                        allowedMentions: {
                            parse: []
                        }
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                }
                sendResponse(interaction, `${process.env.BOT_CONF} ${amount} successfully added to ${user}`);
                break;
            }

            // REMOVE
            case 'remove': {
                // Fetch the user's db entry
                const results = await tokensSchema.find({ userId: user.id });
                // If the user doesn't exist in the db, we don't need to continue
                if (results.length === 0) return sendResponse(interaction, `${process.env.BOT_DENY} This user doesn't have any tokens`);
                for (const data of results) {
                    const { tokens } = data;
                    // If the user has no tokens to remove
                    if (tokens === 0) return sendResponse(interaction, `${process.env.BOT_DENY} This user doesn't have any tokens`);
                    // Don't allow tokens to drop below 0
                    if ((tokens - amount) < 0) amount = tokens;
                    // Remove the desired amount of tokens
                    await dbUpdateOne(tokensSchema, { userId: user.id }, { tokens: tokens - amount });
                    // Log when a user's tokens increase or decrease
                    tokenLog.send({
                        content: `${process.env.TOKENS_MANUAL} ${member} removed **${amount}** ${amount > 1 ? 'tokens' : 'token'} from ${user}, they now have **${tokens - amount}** tokens`,
                        allowedMentions: {
                            parse: []
                        }
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                }
                sendResponse(interaction, `${process.env.BOT_CONF} ${amount} ${tokenAmount} successfully removed from ${user}`);
                break;
            }
        }
    }
}