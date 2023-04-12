const { promisify } = require('util');
const { glob } = require('glob');
const PG = promisify(glob);

module.exports = async (client) => {
    // Only register commands in dev environment
    commandsArr = [];
    // globalCom = [];
    (await PG(`${process.cwd()}/commands/*/*/*.js`)).map(async (file) => {
        let command = require(file);
        client.commands.set(command.name, command);
        if (command.name !== 'rank' || command.name !== 'automodcreate' || command.name !== 'automoddelete' || command.name !== 'automodfetch') commandsArr.push(command);
        // if (command.name === 'rank' || command.name === 'automodcreate' || command.name === 'automoddelete' || command.name === 'automodfetch') globalCom.push(command);
    });
    client.on('ready', async () => {
        if (!process.env.DEV) return;
        const guild = await client.guilds.cache.get(process.env.GUILD_ID);
        guild.commands.set(commandsArr);
        // client.application.commands.set(globalCom);
    });
}