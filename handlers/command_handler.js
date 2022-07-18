const { promisify } = require('util');
const { glob } = require('glob');
const PG = promisify(glob);

module.exports = async (client, Discord) => {
    commandsArr = [];
    (await PG(`${process.cwd()}/commands/*/*/*.js`)).map(async (file) => {
        let command = require(file);
        client.commands.set(command.name, command);
        commandsArr.push(command);
    });
    client.on('ready', async () => {
        const mainGuild = await client.guilds.cache.get(process.env.GUILD_ID);
        mainGuild.commands.set(commandsArr)
    });
}