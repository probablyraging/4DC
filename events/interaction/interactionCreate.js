const { client, CommandInteraction, InteractionType } = require('discord.js');
const cooldowns = new Map();
const commandCountSchema = require('../../schemas/misc/command_count');
// const commandUsageSchema = require('../../schemas/database_logs/command_usage');
const colorSelect = require('../../handlers/select_menus/color_select');
const platformSelect = require('../../handlers/select_menus/platform_select');
const ageSelect = require('../../handlers/select_menus/age_select');
const regionSelect = require('../../handlers/select_menus/region_select');
const genderSelect = require('../../handlers/select_menus/gender_select');
const customSelect = require('../../handlers/select_menus/custom_select');
const reportModal = require('../../handlers/modals/report_modal');
const massbanModal = require('../../handlers/modals/massban_modal');
const channelMuteModal = require('../../handlers/modals/channel_mute_modal');
const path = require('path');

module.exports = {
    name: 'interactionCreate',
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {client} client 
     */
    async execute(interaction, client, Discord) {
        const { member, channel, user, guild, options } = interaction

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

        // Select menu handler
        if (interaction.type === InteractionType.MessageComponent) {
            if (interaction.customId === 'color-select') {
                colorSelect(interaction);
            }
            if (interaction.customId === 'platform-select') {
                platformSelect(interaction);
            }
            if (interaction.customId === 'age-select') {
                ageSelect(interaction);
            }
            if (interaction.customId === 'region-select') {
                regionSelect(interaction);
            }
            if (interaction.customId === 'gender-select') {
                genderSelect(interaction);
            }
            if (interaction.customId === 'custom-select') {
                customSelect(interaction);
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
        }

        // Command and context menu handler
        if (interaction.type === InteractionType.ApplicationCommand) {
            if (!command) return interaction.reply({
                content: `${process.env.BOT_INFO} Could not run this command`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err))
                && client.command.module(interaction.commandName);

            command.execute(interaction, client)

            // log command usage
            console.log(`\x1b[36m%s\x1b[0m`, `${interaction.member.displayName}`, `used /${command.name}`);

            const results = await commandCountSchema.find({ command: command.name })

            if (results.length === 0) {
                await commandCountSchema.updateOne({
                    command: command.name
                }, {
                    command: command.name,
                    uses: 1
                }, {
                    upsert: true
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
            } else {
                for (const data of results) {
                    let { uses } = data;

                    let usesAdd = uses + 1;

                    await commandCountSchema.updateOne({
                        command: command.name,
                    }, {
                        uses: usesAdd
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
                }
            }

            let cmdName = command.name;
            if (options._subcommand) cmdName = `${command.name} > ${options._subcommand}`;

            cmdOptions = [];

            options._hoistedOptions.forEach(option => {
                if (option.name === 'command') cmdOptions.push(`Param: ${option?.value}`);
                if (option.name === 'reason') cmdOptions.push(`Param: ${option?.value}`);
                if (option.name === 'number') cmdOptions.push(`Param: ${option?.value}`);
                if (option.name === 'username') cmdOptions.push(`User: ${option?.user?.tag}`);
                if (option.name === 'channel') cmdOptions.push(`Channel: #${option?.channel?.name}`);
            })

            let input = cmdOptions.join('\n') || 'None';

            const logTimestamp = new Date().getTime();

            // Log to database for dashboard
            // await commandUsageSchema.create({
            //     userId: user?.id,
            //     username: user?.tag,
            //     command: cmdName,
            //     input: input,
            //     timestamp: logTimestamp,
            //     type: 'Command Usage'
            // });
        }
    }
}