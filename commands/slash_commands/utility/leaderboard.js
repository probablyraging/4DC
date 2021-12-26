const { ContextMenuInteraction, MessageEmbed } = require('discord.js');
const mongo = require('../../../mongo');
const letterSchema = require('../../../schemas/letter-schema');
const letterRecordSchema = require('../../../schemas/letter-record-schema');
const letterLBSchema = require('../../../schemas/letter-lb-schema');
const path = require('path');
const fetch = require('node-fetch');

module.exports = {
    name: `leaderboard`,
    description: `View leaderboards for the server ranks, games and others`,
    permission: ``,
    type: `CHAT_INPUT`,
    options: [{
        name: `ranks`,
        description: `View the server's rank leaderboard`,
        type: `SUB_COMMAND`,
        usage: `/leaderboard rank`,
    },
    {
        name: `lastletter`,
        description: `View the lastlatter game's leaderboard`,
        type: `SUB_COMMAND`,
        usage: `/leaderboard lastletter`,
    },
    {
        name: `levels`,
        description: `View the server's level leaderboard`,
        type: `SUB_COMMAND`,
        usage: `/leaderboard levels`,
    }],
    /**
     * 
     * @param {ContextMenuInteraction} interaction 
     */
    async execute(interaction) {
        const { client, guild, options } = interaction;

        try {
            switch (options.getSubcommand()) {
                case 'ranks': {
                    const response = new MessageEmbed()
                        .setColor('#32BEA6')
                        .setFooter(`${guild.name}`, `${guild.iconURL({ dynamic: true })}`)
                        .setTimestamp()

                    const resolve = await fetch('https://mee6.xyz/api/plugins/levels/leaderboard/820889004055855144');
                    const data = await resolve.json();

                    const userData = data.players;

                    function kFormatter(num) {
                        return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000 * 1).toFixed(0)) + 'K' : Math.sign(num) * Math.abs(num);
                    }

                    dataArr = [];

                    for (let i = 0; i < 10; i++) {
                        xp = kFormatter(userData[i].detailed_xp[2]);
                        dataArr.push(xp);
                    }

                    response.addField(`:trophy: \`CreatorHub Rank Leaderboard\``, `⠀
🥇 <@${userData[0].id}> - **${dataArr[0]}** XP
🥈 <@${userData[1].id}> - **${dataArr[1]}** XP
🥉 <@${userData[2].id}> - **${dataArr[2]}** XP
\`4.\` <@${userData[3].id}> - **${dataArr[3]}** XP
\`5.\` <@${userData[4].id}> - **${dataArr[4]}** XP
\`6.\` <@${userData[5].id}> - **${dataArr[5]}** XP
\`7.\` <@${userData[6].id}> - **${dataArr[6]}** XP
\`8.\` <@${userData[7].id}> - **${dataArr[7]}** XP
\`9.\` <@${userData[8].id}> - **${dataArr[8]}** XP
\`10.\` <@${userData[9].id}> - **${dataArr[9]}** XP`, false)

                    interaction.reply({
                        embeds: [response],
                        ephemeral: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                }
            }

            switch (options.getSubcommand()) {
                case 'lastletter': {
                    var searchFor = 'currentCount'
                    await mongo().then(async (mongoose) => {
                        try {
                            const results = await letterSchema.find({ searchFor });
                            for (const info of results) {
                                var { currentLetterCounter } = info;
                                gotCount = currentLetterCounter;
                            }
                        } finally {
                            // do bothing
                        }
                    });

                    let searchForRecord = 'currentRecord'
                    await mongo().then(async (mongoose) => {
                        try {
                            const results = await letterRecordSchema.find({ searchForRecord });
                            for (const info of results) {
                                const { letterRecord } = info;
                                const letterChannel = client.channels.cache.get('896069772624683018');

                                letterChannel.messages.fetch({ limit: 1 }).then(async fetched => {
                                    fetched.forEach(msg => {
                                        lastSubmit = msg.author;
                                    });

                                    let searchFor = 'currentCount';
                                    await mongo().then(async (mongoose) => {
                                        try {

                                            const results = await letterLBSchema.find({ searchFor });

                                            resultsArr = [];

                                            for (const info of results) {
                                                const { userId, correctCount } = info;

                                                dbUser = userId;
                                                dbcorrectCount = correctCount;

                                                resultsArr.push({ userId, correctCount });

                                            }

                                            resultsArr.sort(function (a, b) {
                                                return b.correctCount - a.correctCount;
                                            });

                                            letterArr = [];

                                            for (let i = 0; i < 10; i++) {
                                                letterArr.push(resultsArr[i].userId, resultsArr[i].correctCount);
                                            }

                                            let lllbEmbed = new MessageEmbed()
                                                .setColor('#32BEA6')
                                                .setFooter(`${guild.name}`)
                                                .setTimestamp()
                                                .addField(`🏆 \`Last Letter Leaderboard\``, `⠀
🥇 <@${letterArr[0]}> - **${letterArr[1]}** correct words
🥈 <@${letterArr[2]}> - **${letterArr[3]}** correct words
🥉 <@${letterArr[4]}> - **${letterArr[5]}** correct words
\`4.\` <@${letterArr[6]}> - **${letterArr[7]}** correct words
\`5.\` <@${letterArr[8]}> - **${letterArr[9]}** correct words
\`6.\` <@${letterArr[10]}> - **${letterArr[11]}** correct words
\`7.\` <@${letterArr[12]}> - **${letterArr[13]}** correct words
\`8.\` <@${letterArr[14]}> - **${letterArr[15]}** correct words
\`9.\` <@${letterArr[16]}> - **${letterArr[17]}** correct words
\`10.\` <@${letterArr[18]}> - **${letterArr[19]}** correct words
        
Last submit by: ${lastSubmit}
Current level: **${gotCount}**
Highest level: **${letterRecord}**`, false)

                                            interaction.reply({
                                                embeds: [lllbEmbed],
                                                ephemeral: true
                                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                                        } finally {
                                            // do nothing
                                        }
                                    });
                                });
                            }
                        } finally {
                            // do nothing
                        }
                    });
                }
            }

            switch (options.getSubcommand()) {
                case 'levels': {
                    const response = new MessageEmbed()
                        .setColor('#32BEA6')
                        .setTitle(`CreatorHub Leaderboard`)
                        .setURL(`https://mee6.xyz/leaderboard/${process.env.GUILD_ID}`)
                        .setDescription(`View the CreatorHub leaderboard **[HERE](https://mee6.xyz/leaderboard/${process.env.GUILD_ID})**`)

                    interaction.reply({
                        embeds: [response],
                        ephemeral: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                }
            }
        } catch (err) {
            console.error(err);
        }
    }
}