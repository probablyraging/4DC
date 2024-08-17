// eslint-disable-next-line no-unused-vars
import { CommandInteraction, ApplicationCommandType, ActivityType } from 'discord.js';
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

                const response = `Created On: <t:${parseInt(guild.createdTimestamp / 1000)}> *(<t:${parseInt(guild.createdTimestamp / 1000)}:R>)*\n Online: ${online}\n Idle: ${idle}\n DND: ${dnd}\n Playing: ${activities[1]}\n Streaming: ${activities[2]}\n Listening: ${activities[3]}\n Watching: ${activities[4]}\n Custom: ${activities[5]}\n Competing: ${activities[6]}\n Total: ${guild.memberCount}`;

                sendResponse(interaction, response);
            });
    },
};