const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
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
        const messageId = options.getString('message_id');

        // Avoid adding tokens to bots
        if (user.bot) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} This user is a bot`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }

        // Amount must always be greater than 0
        if (amount < 1) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} Amount must be greater than 0`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }

        switch (options.getSubcommand()) {
            // ADD
            case 'add': {
                // Fetch the user's db entry
                const results = await tokensSchema.find({ userId: user.id });

                // Check to see if the user is in our database yet, if not, add them
                if (results.length === 0) {
                    await tokensSchema.create({
                        userId: user.id,
                        tokens: amount
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                    if (amount === 1) tokenAmount = `token`;
                    if (amount > 1) tokenAmount = `tokens`;

                    // Log when a user's tokens increase or decrease
                    tokenLog.send({
                        content: `${process.env.TOKENS_MANUAL} ${member} added **${amount}** ${tokenAmount} to ${user}, they now have **${amount}** tokens`,
                        allowedMentions: {
                            parse: []
                        }
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                }

                for (const data of results) {
                    let { tokens, dailyTokens } = data;
                    // Hard cap of earning 75 tokens per day
                    if (isNaN(dailyTokens)) dailyTokens = 0;
                    if ((dailyTokens + amount) > 75) {
                        return interaction.editReply({
                            content: `${process.env.BOT_DENY} This would exceed ${user}'s daily token cap. They can only earn **${75 - dailyTokens}** more tokens today`
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
                    }
                    // Add the desired amount of tokens
                    await tokensSchema.updateOne({
                        userId: user.id
                    }, {
                        tokens: tokens + amount,
                        dailyTokens: dailyTokens + amount
                    }, {
                        upsert: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                    if (amount === 1) tokenAmount = `token`;
                    if (amount > 1) tokenAmount = `tokens`;

                    // Log when a user's tokens increase or decrease
                    tokenLog.send({
                        content: `${process.env.TOKENS_MANUAL} ${member} added **${amount}** ${tokenAmount} to ${user}, they now have **${tokens + amount}** tokens`,
                        allowedMentions: {
                            parse: []
                        }
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                }

                interaction.editReply({
                    content: `${process.env.BOT_CONF} ${amount} ${tokenAmount} successfully added to ${user}`
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));

                break;
            }

            // REMOVE
            case 'remove': {
                // Fetch the user's db entry
                const results = await tokensSchema.find({ userId: user.id });

                // If the user doesn't exist in the db, we don't need to continue
                if (results.length === 0) {
                    return interaction.editReply({
                        content: `${process.env.BOT_DENY} This user doesn't have any tokens`
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
                }

                for (const data of results) {
                    const { tokens } = data;

                    // If the user has no tokens to remove
                    if (tokens === 0) {
                        return interaction.editReply({
                            content: `${process.env.BOT_DENY} This user doesn't have any tokens`
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
                    }

                    // Don't allow tokens to drop below 0
                    if ((tokens - amount) < 0) amount = tokens;

                    // Remove the desired amount of tokens
                    await tokensSchema.updateOne({
                        userId: user.id
                    }, {
                        tokens: tokens - amount,
                    }, {
                        upsert: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                    if (amount === 1) tokenAmount = `token`;
                    if (amount > 1) tokenAmount = `tokens`;

                    // Log when a user's tokens increase or decrease
                    tokenLog.send({
                        content: `${process.env.TOKENS_MANUAL} ${member} removed **${amount}** ${tokenAmount} from ${user}, they now have **${tokens - amount}** tokens`,
                        allowedMentions: {
                            parse: []
                        }
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
                }

                interaction.editReply({
                    content: `${process.env.BOT_CONF} ${amount} ${tokenAmount} successfully removed from ${user}`
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));

                break;
            }
        }
    }
}