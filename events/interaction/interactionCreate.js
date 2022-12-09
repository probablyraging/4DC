const { client, CommandInteraction, InteractionType } = require('discord.js');
const cooldowns = new Map();
const colorButton = require('../../handlers/buttons/color_buttons');
const platformButton = require('../../handlers/buttons/platform_button');
const ageButton = require('../../handlers/buttons/age_button');
const regionButton = require('../../handlers/buttons/region_button');
const genderButton = require('../../handlers/buttons/gender_button');
const customButton = require('../../handlers/buttons/custom_button');
const reportButton = require('../../handlers/buttons/report_button');
const storeEpicButton = require('../../handlers/buttons/store/store_epic');
const storeLegendaryButton = require('../../handlers/buttons/store/store_legendary');
const storeRareButton = require('../../handlers/buttons/store/store_rare');
const storeCommonButton = require('../../handlers/buttons/store/store_common');
const storeRankButton = require('../../handlers/buttons/store/store_rank');
const storeInfoButton = require('../../handlers/buttons/store/store_info');
const reportModal = require('../../handlers/modals/report_modal');
const reportImageButton = require('../../handlers/buttons/txt2img_button');
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
        if (channel.type === 1 && interaction.customId.split('-')[0] !== 'storeinfo') {
            return interaction.reply({
                content: 'Command not available',
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        }

        let command = client.commands.get(interaction.commandName);

        // Cooldown handler
        if (interaction.type === InteractionType.ApplicationCommand) {
            if (!cooldowns.has(command.name)) {
                cooldowns.set(command.name, new Discord.Collection());
            }

            const current_time = Date.now();
            const time_stamps = cooldowns.get(command.name);
            const cooldown_amount = (command.cooldown) * 1000;

            if (!member.permissions.has("Administrator")) {
                if (time_stamps.has(member.id)) {
                    const expiration_time = time_stamps.get(member.id) + cooldown_amount;
                    const time_left = (expiration_time - current_time) / 1000;

                    if (current_time < expiration_time) {
                        // For cooldowns longer than 60 seconds
                        if (time_left > 60) {
                            return interaction.reply({
                                content: `${process.env.BOT_DENY} Cooldown: ${Math.round(time_left.toFixed(1) / 60)} minutes`,
                                ephemeral: true
                            })
                        } else {
                            return interaction.reply({
                                content: `${process.env.BOT_DENY} Cooldown: ${time_left.toFixed(0)} seconds`,
                                ephemeral: true
                            })
                        }
                    }
                }
                time_stamps.set(member.id, current_time);

                setTimeout(() => time_stamps.delete(member.id), cooldown_amount);
            }
        }

        // Button submit handler
        if (interaction.isButton()) {
            // Self Roles
            if (interaction.customId.split('-')[0] === 'color') {
                colorButton(interaction);
            }
            if (interaction.customId.split('-')[0] === 'platform') {
                platformButton(interaction);
            }
            if (interaction.customId.split('-')[0] === 'age') {
                ageButton(interaction);
            }
            if (interaction.customId.split('-')[0] === 'region') {
                regionButton(interaction);
            }
            if (interaction.customId.split('-')[0] === 'gender') {
                genderButton(interaction);
            }
            if (interaction.customId.split('-')[0] === 'custom') {
                customButton(interaction);
            }
            // Tokens Store
            if (interaction.customId.split('-')[0] === 'storeepic') {
                storeEpicButton(interaction);
            }
            if (interaction.customId.split('-')[0] === 'storelegendary') {
                storeLegendaryButton(interaction);
            }
            if (interaction.customId.split('-')[0] === 'storerare') {
                storeRareButton(interaction);
            }
            if (interaction.customId.split('-')[0] === 'storecommon') {
                storeCommonButton(interaction);
            }
            if (interaction.customId.split('-')[0] === 'storerank') {
                storeRankButton(interaction);
            }
            if (interaction.customId.split('-')[0] === 'storeinfo') {
                storeInfoButton(interaction);
            }
            // Reports
            if (interaction.customId === 'report-close') {
                reportButton(interaction);
            }
            if (interaction.customId === 'delete-image') {
                reportImageButton(interaction);
            }
        }

        // Modal submit handler
        if (interaction.type === InteractionType.ModalSubmit) {
            if (interaction.customId === 'report-modal') {
                reportModal(interaction);
            }
            if (interaction.customId === 'massban-modal') {
                massbanModal(interaction);
            }
            if (interaction.customId === 'channel-mute-modal') {
                channelMuteModal(interaction);
            }
            // Tokens Store
            if (interaction.customId.split('-')[0] === 'storeepic') {
                storeEpicButton(interaction);
            }
            if (interaction.customId.split('-')[0] === 'storelegendary') {
                storeLegendaryButton(interaction);
            }
            if (interaction.customId.split('-')[0] === 'storerare') {
                storeRareButton(interaction);
            }
            if (interaction.customId.split('-')[0] === 'storecommon') {
                storeCommonButton(interaction);
            }
            if (interaction.customId.split('-')[0] === 'storerank') {
                storeRankButton(interaction);
            }
        }

        // Command and context menu handler
        if (interaction.type === InteractionType.ApplicationCommand) {
            if (!command) return interaction.reply({
                content: `${process.env.BOT_INFO} Could not run this command`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err))
                && client.command.module(interaction.commandName);

            command.execute(interaction, client);

            // log command usage
            console.log(`\x1b[36m%s\x1b[0m`, `${interaction.member.displayName}`, `used /${command.name}`);
        }
    }
}