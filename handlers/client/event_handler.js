import { promisify } from 'util';
import glob from 'glob';
const PG = promisify(glob);

export default async (client, Discord) => {
    (await PG(`${process.cwd()}/events/*/*.js`)).map(async (file) => {
        const { default: event } = await import('file://' + file);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client, Discord));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client, Discord));
        }
    });
};