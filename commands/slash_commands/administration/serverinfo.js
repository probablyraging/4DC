// eslint-disable-next-line no-unused-vars
import { CommandInteraction, ApplicationCommandType, EmbedBuilder, ActivityType } from 'discord.js';
import { sendResponse } from '../../../utils/utils.js';
import axios from 'axios';

export default {
    name: 'serverinfo',
    description: 'Get information and stats about the server',
    defaultMemberPermissions: ['Administrator'],
    cooldown: 5,
    dm_permission: false,
    type: ApplicationCommandType.ChatInput,
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const { guild } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error('There was a problem deferring an interaction: ', err));

        const activityTypes = [ActivityType.Streaming, ActivityType.Playing, ActivityType.Listening, ActivityType.Watching, ActivityType.Competing, ActivityType.Custom];

        guild.members.fetch().catch(err => console.error('There was a problem fetching a guild member: ', err))
            .then(async fetchedMembers => {
                const memberData = await axios.get('https://discord.com/api/v9/guilds/820889004055855144?with_counts=true', { headers: { 'Authorization': `Bot ${process.env.BOT_TOKEN}` } });
                const online = memberData.data.approximate_presence_count;
                const idle = fetchedMembers.filter(member => member.presence?.status === 'idle').size;
                const dnd = fetchedMembers.filter(member => member.presence?.status === 'dnd').size;

                const activities = {
                    1: 0, // Playing
                    2: 0, // Streaming
                    3: 0, // Listening
                    4: 0, // Watching
                    5: 0, // Custom
                    6: 0, // Competing
                };

                fetchedMembers.forEach(member => {
                    if (member?.presence?.activities) {
                        for (const activity of member.presence.activities) {
                            const activityType = activityTypes[activity.type];
                            if (activityType) {
                                activities[activityType]++;
                            }
                        }
                    }
                });

                const vanityURL = guild.vanityURLCode ? `https://discord.gg/${guild.vanityURLCode}` : 'None';
                const description = guild.description || 'None';
                const premiumTier = guild.premiumTier;

                const response = new EmbedBuilder()
                    .setColor('#32BEA6')
                    .setTitle(`${guild.name}'s Server Information`)
                    .setThumbnail(`${guild.iconURL({ dynamic: true })}`)
                    .setImage()
                    .addFields({ name: 'Name', value: `${guild.name}`, inline: true },
                        { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
                        { name: 'Region', value: 'Australia', inline: true },
                        { name: 'Description', value: `${description}`, inline: false },
                        { name: 'Server Boosts', value: `${guild.premiumSubscriptionCount}`, inline: true },
                        { name: 'Boost Tier', value: `${premiumTier}`, inline: true },
                        { name: 'Created On', value: `<t:${parseInt(guild.createdTimestamp / 1000)}> \n*(<t:${parseInt(guild.createdTimestamp / 1000)}:R>)*`, inline: true },
                        { name: 'Vanity URL', value: `${vanityURL}`, inline: false });

                const response2 = new EmbedBuilder()
                    .setColor('#32BEA6')
                    .setTitle(`${guild.name}'s Server Stats`)
                    .addFields({ name: 'Online', value: `${online}`, inline: true },
                        { name: 'Idle', value: `${idle}`, inline: true },
                        { name: 'DND', value: `${dnd}`, inline: true },
                        { name: 'Playing', value: `${activities[1]}`, inline: true },
                        { name: 'Streaming', value: `${activities[2]}`, inline: true },
                        { name: 'Listening', value: `${activities[3]}`, inline: true },
                        { name: 'Watching', value: `${activities[4]}`, inline: true },
                        { name: 'Custom', value: `${activities[5]}`, inline: true },
                        { name: 'Competing', value: `${activities[6]}`, inline: true },
                        { name: 'Total Members', value: `${guild.memberCount}`, inline: false });

                sendResponse(interaction, '', [response, response2]);
            });
    },
};