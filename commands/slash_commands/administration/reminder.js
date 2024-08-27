// eslint-disable-next-line no-unused-vars
import { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';
import { dbCreate, sendResponse } from '../../../utils/utils.js';
import remindersSchema from '../../../schemas/reminders.js';
import moment from 'moment';

export default {
    name: 'reminder',
    description: 'Create a reminder',
    defaultMemberPermissions: ['Administrator'],
    cooldown: 5,
    dm_permission: false,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: 'time',
        description: 'The time to remind the user (e.g 16:45)',
        type: ApplicationCommandOptionType.String,
        required: true,
    },
    {
        name: 'date',
        description: 'The date to remind the user (e.g 05/02/91)',
        type: ApplicationCommandOptionType.String,
        required: true,
    },
    {
        name: 'message',
        description: 'The message to be reminded about',
        type: ApplicationCommandOptionType.String,
        required: true,
    }],
    /**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const { user } = interaction;

        await interaction.deferReply({ ephemeral: true }).catch(err => console.error('There was a problem deferring an interaction: ', err));

        const timeString = interaction.options.getString('time');
        const dateString = interaction.options.getString('date');
        const message = interaction.options.getString('message');

        // Convert the time and date to a Unix timestamp
        const reminderTimestamp = moment(`${dateString} ${timeString}`, 'DD/MM/YY HH:mm').unix();

        // Make sure the timestamp is in the future
        if (reminderTimestamp <= moment().unix()) {
            return sendResponse(interaction, 'The date you provided is in the past');
        }

        // Save to db
        await dbCreate(remindersSchema, { timestamp: reminderTimestamp, userId: user.id, message: message });

        sendResponse(interaction, `**Your reminder has been set** \n> <t:${reminderTimestamp}> \n> ${message}`);
    },
};