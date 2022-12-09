const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const tokensSchema = require('../../../schemas/misc/tokens_schema');
const path = require('path');

module.exports = {
    name: `gifttokens`,
    description: `Gift another user some of your own tokens`,
    cooldown: 60,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `user`,
        description: `The user you want to add tokens to`,
        type: ApplicationCommandOptionType.User,
        required: true,
    },
    {
        name: `amount`,
        description: `The amount of tokens you want to gift`,
        type: ApplicationCommandOptionType.Number,
        required: true,
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { guild, options, member } = interaction;

        await interaction.deferReply({ ephemeral: true });

        const tokenLog = guild.channels.cache.get(process.env.CREDITLOG_CHAN);
        const user = options.getUser('user');
        const amount = options.getNumber('amount');

        // Avoid adding tokens to bots
        if (user.bot) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} This user is a bot`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }

        // Don't allow users to gift tokens to themselves
        if (member.id === user.id) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} You can't gift tokens to yourself`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }

        // Amount must always be greater than 0
        if (amount < 1) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} Amount must be greater than 0`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }

        // Fetch the gifter's db entry
        const results = await tokensSchema.find({ userId: member.id });

        // Check to see if the user is in our database yet, if not, they can't gift tokens
        if (results.length === 0) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} You currently have no tokens to gift`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }

        for (const data of results) {
            const { tokens } = data;

            // If the gifter doesn't have enough tokens
            if (tokens < amount) {
                return interaction.editReply({
                    content: `${process.env.BOT_DENY} You do not have enough tokens. You currently have **${tokens}** tokens`
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
            }

            // Remove the desired amount of tokens
            await tokensSchema.updateOne({
                userId: member.id
            }, {
                tokens: tokens - amount,
            }, {
                upsert: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

            if (amount === 1) tokenAmount = `token`;
            if (amount > 1) tokenAmount = `tokens`;

            // Log when a user's tokens increase or decrease
            tokenLog.send({
                content: `${process.env.TOKENS_GIFT} ${member} gifted **${amount}** ${tokenAmount} to ${user}
${process.env.TOKENS_DOWN} ${member} gave away **${amount}** ${tokenAmount}, they now have **${tokens - amount}** tokens`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
        }

        // Fetch the giftee's db entry
        const results2 = await tokensSchema.find({ userId: user.id });

        // Check to see if the user is in our database yet, if not, add them
        if (results2.length === 0) {
            await tokensSchema.create({
                userId: user.id,
                tokens: amount
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
        }

        for (const data of results2) {
            let { tokens, dailyTokens } = data;
            // Hard cap of earning 50 tokens per day
            if (isNaN(dailyTokens)) dailyTokens = 0;
            if ((dailyTokens + amount) > 75) {
                return interaction.editReply({
                    content: `${process.env.BOT_DENY} This would exceed the user's daily cap. This user can only earn **${50 - dailyTokens}** more tokens today`
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
                content: `${process.env.TOKENS_UP} ${user} gained **${amount}** ${tokenAmount} as a gift, they now have **${tokens + amount}** tokens`,
                allowedMentions: {
                    parse: []
                }
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
        }

        interaction.editReply({
            content: `${process.env.BOT_CONF} ${amount} ${tokenAmount} successfully gifted to ${user}`
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
    }
}