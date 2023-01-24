const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { dbUpdateOne, sendResponse } = require('../../../utils/utils');
const countingSchema = require('../../../schemas/games/counting_schema');
const path = require('path');

module.exports = {
    name: `counting`,
    description: `Commands for the counting game`,
    cooldown: 5,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `save`,
        description: `Information about how to get a save`,
        type: ApplicationCommandOptionType.Subcommand,
    },
    {
        name: `donatesave`,
        description: `Donate a personal save to the guild. 1 personal save = .25 guild saves`,
        type: ApplicationCommandOptionType.Subcommand,
        options: [{
            name: `amount`,
            description: `How many saves you would like to donate`,
            type: ApplicationCommandOptionType.Number,
            required: true,
            choices: [{ name: '1', value: '1' },
            { name: '2', value: '2' }]
        }],
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { member, guild, client, options } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        switch (options.getSubcommand()) {
            case 'save': {
                // Fetch the user and guild saves from the database
                const userResults = await countingSchema.findOne({ userId: member.id })
                    .catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
                const guildResults = await countingSchema.find({ userId: guild.id })
                    .catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
                // If the user doesn't have a database entry yet, creat one
                if (!userResults) await dbUpdateOne(countingSchema, { userId: member.id }, { userId: member.id, counts: 0, saves: 0 });

                sendResponse(interaction, `You currently have \`${userResults?.saves || 0}/2\` saves
The guild currently has \`${guildResults.saves || 0}/3 saves\`

You can earn game saves either by bumping the server. The server can be bumped once every 2 hours, by anyone

To be notified when the server is ready to be bumped again, you can get the <@&${process.env.BUMP_ROLE}> role from <id:customize>`);
                break;
            }

            case 'donatesave': {
                const savesToAdd = options.getNumber('amount');
                // Fetch the user and guild saves from the database
                const userResults = await countingSchema.findOne({ userId: member.id })
                    .catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
                const guildResults = await countingSchema.findOne({ userId: guild.id })
                    .catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));

                const userCurrentSaves = userResults?.saves;
                const guildCurrentSaves = guildResults?.saves;

                // If the user doesn't have a database entry yet
                if (!userResults) return sendResponse(interaction, `You have not earned any saves yet. Learn how to earn saves by using the \`/counting save\` command`);
                // If the user doesn't have any saves
                if (userCurrentSaves === 0) return sendResponse(interaction, `You have \`0 saves\`. Learn how to earn saves by using the \`/counting save\` command`);
                // If the amount of saves to donate is more than the max allowed guild saves
                if ((guildCurrentSaves + savesToAdd / 4) > 3) return sendResponse(interaction, `This would exceed the max amount of saves the guild can have`);
                // If the user doesn't have enough saves
                if (userCurrentSaves < savesToAdd) return sendResponse(interaction, `You don't have enough saves. You currently have \`${userCurrentSaves || 0}/2\``);
                // If the guild already has the max amount of saves
                if (guildCurrentSaves === 3) return sendResponse(interaction, `The guild already has \`3/3\` saves`);

                // Remove 1 save from the user
                await dbUpdateOne(countingSchema, { userId: member.id }, { saves: userCurrentSaves - savesToAdd });
                // Add 0.25 saves to the guild
                await dbUpdateOne(countingSchema, { userId: guild.id }, { saves: guildCurrentSaves + (savesToAdd / 4) });

                // Send a confirmation message to the game channel
                const countingChan = client.channels.cache.get(process.env.COUNT_CHAN);
                countingChan.send({
                    content: `${member} donated \`${savesToAdd} personal save\`. The guild now has \`${guildCurrentSaves + (savesToAdd / 4)}/3 saves\``,
                    allowedMentions: { repliedUser: true },
                    failIfNotExists: false
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

                // Send a follow up response
                sendResponse(interaction, `You have donated \`${savesToAdd} personal saves\` to the guild
> You now have \`${userCurrentSaves - savesToAdd}/2 personal saves\` left
> The guild now has \`${guildCurrentSaves + (savesToAdd / 4)}/3 saves\``);
                break;
            }
        }
    }
}