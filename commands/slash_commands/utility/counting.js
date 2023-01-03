const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const countingSchema = require('../../../schemas/counting_game/counting_schema');
const timerSchema = require('../../../schemas/misc/timer_schema');
const { dbUpdateOne } = require('../../../modules/misc/database_update_handler');
const path = require('path');

function msToHumanTime(milliseconds) {
    let hours = milliseconds / (1000 * 60 * 60);
    let hoursFloor = Math.floor(hours);

    let minutes = (hours - hoursFloor) * 60;
    let minutesFloor = Math.floor(minutes);

    let seconds = (minutes - minutesFloor) * 60;
    let secondFloor = Math.floor(seconds);

    return hoursFloor + " hours, " + minutesFloor + " minutes and " + secondFloor + " seconds";
}

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
                const results = await countingSchema.find({ userId: member.id })
                    .catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
                const bumpResults = await timerSchema.find({ timer: 'bump' })
                    .catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
                const guildResults = await countingSchema.find({ userId: guild.id })
                    .catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));

                if (results.length === 0) {
                    await dbUpdateOne(countingSchema, { userId: member.id }, { userId: member.id, counts: 0, saves: 0 });
                    return getSaves();
                } else {
                    await getSaves();
                }

                async function getSaves() {
                    const results = await countingSchema.find({ userId: member.id })
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));

                    for (const bumpData of bumpResults) {
                        const { timestamp } = bumpData;

                        const timeMath = (timestamp - new Date()).valueOf();
                        const timeTo = msToHumanTime(timeMath)

                        for (const data of results) {
                            let { saves } = data;
                            if (saves === undefined) {
                                saves = 0;
                            }

                            for (const guildData of guildResults) {
                                const guildSaves = guildData.saves;

                                interaction.editReply({
                                    content: `You currently have \`${saves}/2\` saves
The guild currently has \`${guildSaves}/3 saves\`

To earn more saves you must bump the server
The server can be bumped once every 2 hours, by anyone
You can bump the server by going to <#${process.env.BUMP_CHAN}> and typing \`/bump\` when it is ready to be bumped

The server can be bumped again in \`${timeTo}\`

To be notified when the server is ready to be bumped again, you can get the <@&${process.env.BUMP_ROLE}> role from <#${process.env.SELFROLE_CHAN}>`,
                                    ephemeral: true
                                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                            }
                        }
                    }
                }
                break;
            }

            case 'donatesave': {
                let amount = options.getNumber('amount');

                const results = await countingSchema.find({ userId: member.id })
                    .catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
                const guildResults = await countingSchema.find({ userId: guild.id })
                    .catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));

                // if the user isn't in the database
                if (results.length === 0) {
                    return interaction.editReply({
                        content: `You have not earned any saves yet. Learn how to earn saves by using the \`/counting save\` command`,
                        ephemeral: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                }

                for (const data of results) {
                    const { saves } = data;

                    // if the user doesn't have any saves
                    if (saves === 0) {
                        return interaction.editReply({
                            content: `You have \`0 saves\`. Learn how to earn saves by using the \`/counting save\` command`,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    } else {
                        for (const guildData of guildResults) {
                            const guildSaves = guildData.saves;

                            // If the amount of saves to donate is more than the max allowed guild saves
                            if ((guildSaves + amount / 4) > 3) {
                                return interaction.editReply({
                                    content: `This would exceed the max amount of saves the guild can have. The guild currently has \`${guildSaves}/3\` saves`,
                                    ephemeral: true
                                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                            }

                            // If the user doesn't have enough saves
                            if (saves < amount) {
                                return interaction.editReply({
                                    content: `You don't have enough saves. You currently have \`${saves}/2\``,
                                    ephemeral: true
                                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                            }

                            // if the guild already has the max amount of saves
                            if (guildSaves === 3) {
                                return interaction.editReply({
                                    content: `The guild currently has \`3/3\` saves`,
                                    ephemeral: true
                                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                            }

                            // remove 1 save from the user
                            await dbUpdateOne(countingSchema, { userId: member.id }, { saves: saves - amount });

                            // add 0.25 saves to the guild
                            await dbUpdateOne(countingSchema, { userId: guild.id }, { saves: guildSaves + (amount / 4) });

                            client.channels.cache.get(process.env.COUNT_CHAN).send({
                                content: `${member} donated \`${amount} personal save\`. The guild now has \`${guildSaves + (amount / 4)}/3 saves\``,
                                allowedMentions: { repliedUser: true },
                                failIfNotExists: false
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

                            return interaction.editReply({
                                content: `You have donated \`${amount} personal saves\` to the guild
> You now have \`${saves - amount}/2 personal saves\` left
> The guild now has \`${guildSaves + (amount / 4)}/3 saves\``,
                                ephemeral: true
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                        }
                    }
                }
                break;
            }
        }
    }
}