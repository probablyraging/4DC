const { client, CommandInteraction, MessageEmbed } = require('discord.js');
const cooldowns = new Map();
const mongo = require('../../mongo');
const commandCountSchema = require('../../schemas/misc/command_count');
const commandUsageSchema = require('../../schemas/database_logs/command_usage');
const reportModal = require('../../commands/slash_commands/utility/modals/report_modal');
const massbanModal = require('../../commands/slash_commands/moderation/modals/massban_modal');
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

        // owner only commands
        // if (command.locked) {
        //     if (member.id !== process.env.OWNER_ID)
        //         return interaction.reply({
        //             content: `${process.env.BOT_DENY} \`You don't have access to this command\``,
        //             ephemeral: true
        //         }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
        // }

        // We can ignore cooldowns for modal submits
        if (!interaction.isModalSubmit()) {
            // Check for cooldown
            if (!cooldowns.has(command.name)) {
                cooldowns.set(command.name, new Discord.Collection());
            }

            const current_time = Date.now();
            const time_stamps = cooldowns.get(command.name);
            const cooldown_amount = (command.cooldown) * 1000;

            if (!member.permissions.has("ADMINISTRATOR")) {
                if (time_stamps.has(member.id)) {
                    const expiration_time = time_stamps.get(member.id) + cooldown_amount;
                    const time_left = (expiration_time - current_time) / 1000;

                    if (current_time < expiration_time) {
                        return interaction.reply({
                            content: `${process.env.BOT_DENY} \`Cooldown: ${time_left.toFixed(0)} seconds\``,
                            ephemeral: true
                        })
                    }
                }
                time_stamps.set(member.id, current_time);

                setTimeout(() => time_stamps.delete(member.id), cooldown_amount);
            }
        } else {
            applyModal(interaction);
            reportModal(interaction);
            massbanModal(interaction);
        }

        // handle and execute commands
        if (interaction.isCommand() || interaction.isContextMenu()) {
            if (!command) return interaction.reply({
                content: `${process.env.BOT_INFO} Could not run this command`,
                ephemeral: true
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err))
                && client.command.module(interaction.commandName);

            command.execute(interaction, client)

            // log command usage
            console.log(`\x1b[36m%s\x1b[0m`, `${interaction.member.displayName}`, `used /${command.name}`);

            await mongo().then(async mongoose => {
                const results = await commandCountSchema.find({ command: command.name })

                if (results.length === 0) {
                    await commandCountSchema.findOneAndUpdate({
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

                        await commandCountSchema.findOneAndUpdate({
                            command: command.name,
                        }, {
                            uses: usesAdd
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
                    }
                }
            }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));

            let cmdName = command.name;
            if (options._subcommand) cmdName = `${command.name} > ${options._subcommand}`;

            const log = new MessageEmbed()
                .setColor('#FF9E00')
                .setAuthor({ name: `${user?.tag} used a command`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                .addField(`Command`, `${cmdName}`, false)
                .addField(`Channel`, `${channel}`, true)
                .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
                .setTimestamp()

            cmdOptions = [];

            options._hoistedOptions.forEach(option => {
                if (option.name === 'command') cmdOptions.push(`Param: ${option?.value}`);
                if (option.name === 'reason') cmdOptions.push(`Param: ${option?.value}`);
                if (option.name === 'number') cmdOptions.push(`Param: ${option?.value}`);
                if (option.name === 'username') cmdOptions.push(`User: ${option?.user?.tag}`);
                if (option.name === 'channel') cmdOptions.push(`Channel: #${option?.channel?.name}`);
            })

            let input = cmdOptions.join('\n') || 'None';
            log.addField(`Input`, `\`\`\`${input}\`\`\``, false);

            const logTimestamp = new Date().getTime();

            await mongo().then(async mongoose => {
                await commandUsageSchema.create({
                    userId: user?.id,
                    username: user?.tag,
                    command: cmdName,
                    input: input,
                    timestamp: logTimestamp,
                    type: 'Command Usage'
                });
            });
        }
    }
}