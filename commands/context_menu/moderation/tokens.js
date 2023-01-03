const { CommandInteraction, ApplicationCommandType } = require('discord.js');
const tokensSchema = require('../../../schemas/misc/tokens_schema');
const { dbCreate, dbUpdateOne } = require('../../../modules/misc/database_update_handler');
const path = require('path');

// Add a reaction to the user's message and send a log to the log channel
async function addReactionAndSendLog(targetMessage, tokenLogChannel, targetUser, member, tokens) {
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
            await dbCreate(tokensSchema, { userId: targetUser.id, tokens: 10 });
            await dbUpdateOne(tokensSchema, { userId: member.id }, { availableAward: false });
            await addReactionAndSendLog(targetMessage, tokenLogChannel, targetUser, member, tokens);
        }

        // Add the tokens to the user
        for (const data of results) {
            let { tokens } = data;
            await dbUpdateOne(tokensSchema, { userId: targetUser.id }, { tokens: tokens + 10 });
            await dbUpdateOne(tokensSchema, { userId: member.id }, { availableAward: false });
            await addReactionAndSendLog(targetMessage, tokenLogChannel, targetUser, member, tokens);
        }

        interaction.editReply({
            content: `${process.env.BOT_CONF} 10 tokens successfully awarded to ${targetUser}`
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing an interaction: `, err));
    }
}