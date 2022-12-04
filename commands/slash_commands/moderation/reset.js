const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { featuredRandomPicker } = require('../../../modules/bump_ckq/featured_post');
const timerSchema = require('../../../schemas/misc/timer_schema');
const path = require('path');

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
                const ckqChannel = guild.channels.cache.get(process.env.SPOTLIGHT_CHAN);
                const ckqRole = guild.roles.cache.get(process.env.SPOTLIGHT_ROLE);

                (await ckqChannel.messages.fetch()).forEach(message => {
                    if (!message.author.bot) message.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
                });

                ckqRole.members.each(member => {
                    member.roles.remove(ckqRole).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a role: `, err));
                });

                ckqChannel.permissionOverwrites.edit(guild.id, {
                    SendMessages: true,
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem editing a channel's permissions: `, err));

                await timerSchema.updateOne({
                    timer: 'spotlight'
                }, {
                    timestamp: 'null',
                }, {
                    upsert: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));

                interaction.editReply({
                    content: `${[process.env.BOT_CONF]} ${ckqChannel} has been reset`,
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
                interaction.editReply({
                    content: `${[process.env.BOT_CONF]} Featured streamer has been reset`,
                    ephemeral: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                break;
            }
        }
    }
}