const { CommandInteraction, ApplicationCommandType } = require('discord.js');
const tokensSchema = require('../../../schemas/misc/tokens_schema');
const path = require('path');

async function addReactionAndSendLog(targetMessage, tokenLogChannel, targetUser, member, tokens) {
    // Add a reaction to the user's message
    targetMessage.react('⭐').catch(err => console.error(`${path.basename(__filename)} There was a problem adding a reaction: `, err));

    tokenLogChannel.send({
        content: `${process.env.TOKENS_AWARD} ${targetUser} was awarded **10** tokens by ${member} for a helpful post they made, they now have **${tokens + 10}** tokens`
    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));
}

module.exports = {
    name: `Award 10 Tokens`,
    defaultMemberPermissions: ['ManageRoles'],
    cooldown: 5,
    type: ApplicationCommandType.Message,
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { guild, channel, member } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        const tokenLogChannel = guild.channels.cache.get(process.env.CREDITLOG_CHAN);
        const targetMessage = await channel.messages.fetch(interaction.targetId);
        const targetUser = targetMessage.author;

        if (targetUser.bot) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} This user is a bot`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }

        // Fetch the user's db entry
        const results = await tokensSchema.find({ userId: targetUser.id });

        // If staff already awarded someone today
        if (results[0].availableAward === false) {
            return interaction.editReply({
                content: `${process.env.BOT_DENY} You have already given out your daily award. You can only give one award per day`
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
        }

        // Check to see if the user is in our database yet, if not, add them
        if (results.length === 0) {
            try {
                await tokensSchema.create(
                    { userId: targetUser.id, tokens: 10 }
                );
                // Mark the member's daily award as used
                await tokensSchema.updateOne(
                    { userId: member.id },
                    { availableAward: false },
                    { upset: true }
                );
            } catch (err) {
                return console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err);
            }

            await addReactionAndSendLog(targetMessage, tokenLogChannel, targetUser, member, tokens);
        }

        // Add the tokens to the user
        for (const data of results) {
            let { tokens } = data;

            try {
                // Add the corrct amount of tokens to the user
                await tokensSchema.updateOne(
                    { userId: targetUser.id },
                    { tokens: tokens + 10 },
                    { upsert: true }
                );
                // Mark the staff member's daily award as being used
                await tokensSchema.updateOne(
                    { userId: member.id },
                    { availableAward: false },
                    { upset: true }
                );
            } catch (err) {
                return console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err);
            }

            await addReactionAndSendLog(targetMessage, tokenLogChannel, targetUser, member, tokens);
        }

        interaction.editReply({
            content: `${process.env.BOT_CONF} 10 tokens successfully awarded to ${targetUser}`
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
    }
}