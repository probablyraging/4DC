const { promisify } = require('util');
const { glob } = require('glob');
const PG = promisify(glob);

module.exports = async (client, Discord) => {
    (await PG(`${process.cwd()}/events/*/*.js`)).map(async (file) => {
        const event = require(file);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client, Discord));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client, Discord));
        }
    });
}