const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { dbUpdateOne, dbDeleteOne, sendResponse } = require('../../../utils/utils');
const { featuredRandomPicker } = require('../../../modules/timers/featured_post');
const timerSchema = require('../../../schemas/misc/timer_schema');
const spotlightSchema = require('../../../schemas/misc/spotlight_schema');
const path = require('path');

function randomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Draw random winner from available tickets
 * @param {Guild} guild The guild object for the server
 * @returns {Object} An object containing a member object and draw data for the winner
 */
async function drawWinner(guild) {
    const results = await spotlightSchema.find();
    if (results.length === 0) return null;
    const draw = results[randomNum(0, results.length - 1)];
    const member = await guild.members.fetch(draw.userId);
    // If member no longer exists, try again
    if (!member) return drawWinner(guild);
    for (const data of results) {
        // Once a winner is picked, delete all tickets
        const { userId } = data;
        await dbDeleteOne(spotlightSchema, { userId: userId });
    }
    const object = {
        member: member,
        draw: draw
    }
    return object;
}

module.exports = {
    name: `reset`,
    description: `Manually reset timed features`,
    defaultMemberPermissions: ['ManageRoles'],
    cooldown: 3,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `option`,
        description: `The channel you want to reset`,
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [{ name: 'contentspotlight', value: 'contentspotlight' },
        { name: 'featuredstreamer', value: 'featuredstreamer' }]
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { client, guild, options } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

        switch (options.getString('option')) {
            case 'contentspotlight': {
                const spotlightChannel = guild.channels.cache.get(process.env.SPOTLIGHT_CHAN);
                const spotlightRole = guild.roles.cache.get(process.env.SPOTLIGHT_ROLE);

                (await spotlightChannel.messages.fetch()).forEach(message => {
                    if (!message.author.bot) message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                });

                spotlightRole.members.each(member => {
                    member.roles.remove(spotlightRole).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a role: `, err));
                });

                spotlightChannel.permissionOverwrites.edit(guild.id, {
                    SendMessages: true,
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err));

                await dbUpdateOne(timerSchema, { timer: 'spotlight' }, { timestamp: 'null' });

                interaction.editReply({
                    content: `${[process.env.BOT_CONF]} ${spotlightChannel} has been reset`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                break;
            }

            case 'featuredstreamer': {
                const featuredRole = guild.roles.cache.get(process.env.FEATURED_ROLE);
                const results = await timerSchema.find({ timer: 'featured' });
                for (const data of results) {
                    const { previouslyFeatured } = data;
                    featuredRole.members.each(member => {
                        member.roles.remove(featuredRole).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a user's role: `, err));
                    })
                    featuredRandomPicker(client, previouslyFeatured);
                }
                sendResponse(interaction, `${process.env.BOT_CONF} Featured streamer has been reset`);
                break;
            }
        }
    }
}