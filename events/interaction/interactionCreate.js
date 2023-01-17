const { client, CommandInteraction, InteractionType } = require('discord.js');
const cooldowns = new Map();
const reportActionButton = require('../../handlers/buttons/misc/report_action_button');
const storePermButton = require('../../handlers/buttons/store/store_perm');
const storeTempButton = require('../../handlers/buttons/store/store_temp');
const storeMiscButton = require('../../handlers/buttons/store/store_misc');
const storeInfoButton = require('../../handlers/buttons/store/store_info');
const reportImageButton = require('../../handlers/buttons/misc/txt2img_button');
const verifyButton = require('../../handlers/buttons/misc/verify_button');
const coinflipButton = require('../../handlers/buttons/misc/coinflip');
const helpButton = require('../../handlers/buttons/misc/help_menu');
const reportModal = require('../../handlers/modals/report_modal');
const banModal = require('../../handlers/modals/ban_modal');
const massbanModal = require('../../handlers/modals/massban_modal');
const channelMuteModal = require('../../handlers/modals/channel_mute_modal');
const path = require('path');

module.exports = {
    name: 'interactionCreate',
    /**
     * @param {CommandInteraction} interaction 
     * @param {client} client 
     */
    async execute(interaction, client, Discord) {
        const { member, channel } = interaction

        // Ignore slash commands ran in DMs
        if (channel.type === 1 && interaction.customId.split('-')[0] !== 'help') {
            return interaction.reply({
                content: 'Command not available via DMs',
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }
        // Get the interaction by name
        let command = client.commands.get(interaction.commandName);
        // Handle the cooldown for individual commands
        if (interaction.type === InteractionType.ApplicationCommand) {
            if (!cooldowns.has(command.name)) cooldowns.set(command.name, new Discord.Collection());

            const currentTime = Date.now();
            const cooldownUsers = cooldowns.get(command.name);
            const cooldownAmount = (command.cooldown) * 1000;

            // Ignore user's with the administrator role for command cooldowns
            if (!member.permissions.has("Administrator")) {
                // If the user is on cooldown for the specific command, notify them
                if (cooldownUsers.has(member.id)) {
                    const expirationTime = cooldownUsers.get(member.id) + cooldownAmount;
                    // Calculate the time left on the user's cooldown in seconds
                    const timeLeft = (expirationTime - currentTime) / 1000;
                    // If the user's cooldown has not yet expired
                    if (currentTime < expirationTime) {
                        const cooldownMessage = timeLeft > 60 ?
                            `${Math.round(timeLeft / 60)} minutes` :
                            `${Math.round(timeLeft)} seconds`;
                        // Notify the user
                        return interaction.reply({
                            content: `${process.env.BOT_DENY} Cooldown: ${cooldownMessage}`,
                            ephemeral: true
                        });
                    }
                }
                // Add the user and current time to the cooldown
                cooldownUsers.set(member.id, currentTime);
                // Remove the user from the cooldown after a period of time
                setTimeout(() => cooldownUsers.delete(member.id), cooldownAmount);
            }
        }

        // Button submit handler
        if (interaction.isButton()) {
            // Get the customId of the button
            const customId = interaction.customId;
            const customIdPrefix = interaction.customId.split('-')[0];

            // A map of customIds for the buttons with prefixed custom IDs
            const prefixedButtons = {
                'perm': storePermButton,
                'giftperm': storePermButton,
                'temp': storeTempButton,
                'gifttemp': storeTempButton,
                'misc': storeMiscButton,
                'giftmisc': storeMiscButton,
                'info': storeInfoButton,
                'help': helpButton,
                'verify': verifyButton,
                'coinflip': coinflipButton
            };
            // Handle tokens store buttons
            if (customIdPrefix in prefixedButtons) prefixedButtons[customIdPrefix](interaction);

            // A map of customIds for misc buttons
            const miscButtons = {
                'report-close': reportActionButton,
                'delete-image': reportImageButton
            };
            // Handle misc buttons
            if (customId in miscButtons) miscButtons[customId](interaction);
        }

        // Modal submit handler
        if (interaction.type === InteractionType.ModalSubmit) {
            // The customId of the modal
            const customId = interaction.customId;
            const customIdPrefix = interaction.customId.split('-')[0];

            // A map of customIds for the modals with prefixed custom IDs
            const prefixedModals = {
                'perm': storePermButton,
                'giftperm': storePermButton,
                'temp': storeTempButton,
                'gifttemp': storeTempButton,
                'misc': storeMiscButton,
                'giftmisc': storeMiscButton,
                'info': storeInfoButton
            };
            // Handle tokens store modals
            if (customIdPrefix in prefixedModals) prefixedModals[customIdPrefix](interaction);

            // A map of customIds for misc modals
            const miscModals = {
                'report-modal': reportModal,
                'ban-modal': banModal,
                'massban-modal': massbanModal,
                'channel-mute-modal': channelMuteModal,
            };
            // Handle misc modals
            if (customId in miscModals) miscModals[customId](interaction);
        }

        // Select menu submit handler
        if (interaction.type === InteractionType.MessageComponent) {
            // The customId of the select menu
            const customIdPrefix = interaction.customId;

            // A map of customIds for the select menus
            const prefixedSelects = {
                'captcha': verifyButton
            };
            // Handle tokens store modals
            if (customIdPrefix in prefixedSelects) prefixedSelects[customIdPrefix](interaction);
        }

        // Command and context menu handler
        if (interaction.type === InteractionType.ApplicationCommand) {
            // If no command was found
            if (!command) return interaction.reply({
                content: `${process.env.BOT_INFO} Could not run this command`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err))
                && client.command.module(interaction.commandName);
            // Execure the command
            command.execute(interaction, client);
            // log command usage
            console.log(`\x1b[36m%s\x1b[0m`, `${interaction.member.displayName}`, `used /${command.name}`);
        }
    }
}