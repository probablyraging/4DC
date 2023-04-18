const { promisify } = require('util');
const { glob } = require('glob');
const PG = promisify(glob);

module.exports = async (client) => {
    commandsArr = [];
    // globalCom = [];
    (await PG(`${process.cwd()}/commands/*/*/*.js`)).map(async (file) => {
        let command = require(file);
        client.commands.set(command.name, command);
        if (!command.global) commandsArr.push(command);
        // if (command.global) globalCom.push(command);
    });
    client.on('ready', async () => {
        const guild = await client.guilds.cache.get(process.env.GUILD_ID);
        // guild.commands.set(commandsArr);
        // client.application.commands.set(globalCom);
    });
}