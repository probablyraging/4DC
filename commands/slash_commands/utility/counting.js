const { ContextMenuInteraction } = require('discord.js');
const mongo = require('../../../mongo');
const countingSchema = require('../../../schemas/counting-schema');
const timerSchema = require('../../../schemas/timer-schema');
const { msToHumanTime } = require("../../../modules/mods_choice/mods_choice_utils");
const path = require('path');

module.exports = {
    name: `counting`,
    description: `Information about the counting game`,
    permission: ``,
    cooldown: 5,
    type: `CHAT_INPUT`,
    options: [{
        name: `save`,
        description: `Information about how to get a save`,
        type: `SUB_COMMAND`,
        usage: `/counting save`,
    },
    {
        name: `donatesave`,
        description: `Donate a personal save to the guild. 1 personal save = .25 guild saves`,
        type: `SUB_COMMAND`,
        usage: `/counting donatesave`,
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { member, guild, options } = interaction;

        await mongo().then(async mongoose => {
            switch (options.getSubcommand()) {
                case 'save': {
                    const results = await countingSchema.find({ userId: member.id })
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
                    const bumpResults = await timerSchema.find({ searchFor: 'bumpTime' })
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));

                    console.log(results.length)

                    if (results.length === 0) {
                        await countingSchema.findOneAndUpdate({
                            userId: member.id,
                        }, {
                            userId: member.id,
                            counts: 0,
                            saves: 0
                        }, {
                            upsert: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));

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
                                const { saves } = data;

                                interaction.reply({
                                    content: `You currently have \`${saves}/2\` saves for the counting game

To earn more saves you must bump the server
The server can be bumped once every 2 hours, by anyone
You can bump the server by going to <#${process.env.BUMP_CHAN}> and typing \`!d bump\` when it is ready to be bumped

The server can be bumped again in \`${timeTo}\`

To be notified when the server is ready to be bumped again, you can get the <@&${process.env.BUMP_ROLE}> role from <#${process.env.SELFROLE_CHAN}>`,
                                    ephemeral: true
                                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                            }
                        }
                    }
                }
            }

            switch (options.getSubcommand()) {
                case 'donatesave': {
                    const results = await countingSchema.find({ userId: member.id })
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
                    const guildResults = await countingSchema.find({ userId: guild.id })
                        .catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));

                    console.log(results.length)
                    // if the user isn't in the database
                    if (results.length === 0) {
                        return interaction.reply({
                            content: `You have not earned any saves yet. Learn how to earn saves by using the \`/counting save\` command`,
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    }

                    for (const data of results) {
                        const { saves } = data;

                        // if the user doesn't have any saves
                        if (saves === 0) {
                            return interaction.reply({
                                content: `You have \`0 saves\`. Learn how to earn saves by using the \`/counting save\` command`,
                                ephemeral: true
                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                        } else {
                            for (const guildData of guildResults) {
                                const guildSaves = guildData.saves;

                                // if the guild already has the max amount of saves
                                if (guildSaves === 3) {
                                    return interaction.reply({
                                        content: `The guild currently has \`3/3\` saves`,
                                        ephemeral: true
                                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                                }

                                // remove 1 save from the user
                                await countingSchema.findOneAndUpdate({
                                    userId: member.id
                                }, {
                                    saves: saves - 1
                                }, {
                                    upsert: true
                                }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));

                                // add 0.25 saves to the guild
                                await countingSchema.findOneAndUpdate({
                                    userId: guild.id
                                }, {
                                    saves: guildSaves + 0.25
                                }, {
                                    upsert: true
                                }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));

                                return interaction.reply({
                                    content: `You have donated \`1 personal save\` to the guild
> You now have \`${saves - 1}/2 personal saves\` left
> The guild now has \`${guildSaves + 0.25}/3 saves\``,
                                    ephemeral: true
                                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                            }
                        }
                    }
                }
            }
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));
    }
}
