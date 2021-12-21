const { events } = require('../validation/event-names');
const { promisify } = require('util');
const { glob } = require('glob');
const PG = promisify(glob);
const ascii = require('ascii-table');

module.exports = async (client, Discord) => {
    const table = new ascii('Events loaded');

    (await PG(`${process.cwd()}/events/*/*.js`)).map(async (file) => {
        const event = require(file);

        if (!events.includes(event.name) || !event.name) {
            const l = file.split('/');
            await table.addRow(`${event.name || 'missing'}`, `Event name invalid or missing: ${l[6] + `/` + l[7]}`);
            return;
        }

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client, Discord));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client, Discord));
        }

        await table.addRow(event.name, `SUCCESSFULLY LOADED!`);
    })
    // console.log(table.toString()); // use to check if events loaded without error
}