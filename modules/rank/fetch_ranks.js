const { Message } = require('discord.js');
const mongo = require('../../mongo');
const rankSchema = require('../../schemas/misc/rank_schema');
const fetch = require('node-fetch');
const path = require('path');
/**
 * @param {Message} message 
 */
module.exports = async (message, client, Discord) => {
    // TODO : this can be deleted once we're done pulling all our user's data
    // setTimeout(async () => {
        page = 0;
        searches = 0;

        await newPage();

        for (var i = 0; i < 91; i++) {
            setTimeout(async function () {
                page++;
                searches += 100;
                await newPage();
            }, i * 10000)
        }

        async function newPage() {
            resolve = await fetch(`https://mee6.xyz/api/plugins/levels/leaderboard/820889004055855144?page=${page}`);
            data = await resolve.json()
            console.log(`Page:`, page)            

            for (var i = 0; i < data.players.length; i++) {
                await mongo().then(async mongoose => {
                    try {
                        await rankSchema.findOneAndRemove({ id: data.players[i].id }).catch(err => console.error(`${path.basename(__filename)} There was a problem removing a database entry: `, err));
                        await rankSchema.findOneAndUpdate({
                            id: data.players[i]?.id,
                        }, {
                            rank: searches + i + 1,
                            id: data.players[i].id,
                            username: data.players[i].username,
                            discrim: data.players[i].discriminator,
                            level: data.players[i].level,
                            msgCount: data.players[i].message_count,
                            xp: data.players[i].xp,
                            xxp: data.players[i].detailed_xp[0],
                            xxxp: data.players[i].detailed_xp[1]
                        }, {
                            upsert: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem updating a database entry: `, err));
                    } finally {
                        // do nothing
                    }
                }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));
            }
        }
        
    // }, 210000);
}

