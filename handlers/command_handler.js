const { perms } = require('../lists/permissions');
const { promisify } = require('util');
const { glob } = require('glob');
const PG = promisify(glob);
const ascii = require('ascii-table')

module.exports = async (client, Discord) => {
    const table = new ascii('Commands loaded!');

    commandsArr = [];

    (await PG(`${process.cwd()}/commands/*/*/*.js`)).map(async (file) => {
        const command = require(file);

        if (!command.name)
            return table.addRow(file.split('/')[7], `FAILED!`, `Missing command name`);

        if (command.type !== 'CHAT_INPUT' && command.type !== 'USER' && command.type !== 'MESSAGE' && !command.description)
            return table.addRow(command.name, `FAILED!`, `Missing command description`);

        if (command.permission) {
            if (perms.includes(command.permission))
                command.defaultPermission = false;
            else
                return table.addRow(command.name, `FAILED!`, `Invalid or missing permission`);
        }

        client.commands.set(command.name, command);
        commandsArr.push(command);

        await table.addRow(command.name, `SUCCESSFULLY LOADED!`);
    });
    console.log(table.toString()); // use to check if commands loaded without error

    // permissions check
    client.on('ready', async () => {
        const mainGuild = await client.guilds.cache.get(process.env.GUILD_ID);

        mainGuild.commands.set(commandsArr).then(async (command) => {
            const Roles = (commandName) => {
                const cmdPerms = commandsArr.find(c => c.name === commandName).permission;
                if (!cmdPerms) return null;

                return mainGuild.roles.cache.filter(r => r?.permissions.has(cmdPerms));
            }

            const fullPermissions = command.reduce((accumulator, r) => {
                const roles = Roles(r.name);
                if (!roles) return accumulator;

                const permissions = roles.reduce((a, r) => {
                    return [...a, { id: r.id, type: 'ROLE', permission: true }]
                }, []);

                return [...accumulator, { id: r.id, permissions }]
            }, []);

            await mainGuild.commands.permissions.set({ fullPermissions })
        });
    });
}