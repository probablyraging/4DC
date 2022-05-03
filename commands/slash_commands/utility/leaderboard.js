const { ContextMenuInteraction, MessageEmbed } = require('discord.js');
const mongo = require('../../../mongo');
const letterSchema = require('../../../schemas/letter_game/letter_schema');
const letterRecordSchema = require('../../../schemas/letter_game/letter_record_schema');
const letterLBSchema = require('../../../schemas/letter_game/letter_lb_schema');
const rankSchema = require('../../../schemas/misc/rank_schema');
const countingSchema = require('../../../schemas/counting_game/counting_schema');
const countingCurrent = require('../../../schemas/counting_game/counting_current_schema');
const path = require('path');

module.exports = {
    name: `leaderboard`,
    description: `View leaderboards for the server ranks, games and others`,
    access: '',
    cooldown: 5,
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
        name: `messages`,
        description: `View the message count leaderboard`,
        type: `SUB_COMMAND`,
        usage: `/leaderboard messages`,
    },
    {
        name: `counting`,
        description: `View the counting game's leaderboard`,
        type: `SUB_COMMAND`,
        usage: `/leaderboard messages`,
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
                    await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

                    const response = new MessageEmbed()
                        .setColor('#32BEA6')
                        .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
                        .setTimestamp()

                    await mongo().then(async mongoose => {
                        const sort = await rankSchema.find({ rank: { $gte: 1, $lt: 50 } }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));

                        sortArr = [];
                        for (const data of sort) {
                            const { id, xp } = data;

                            sortArr.push({ id, xp });
                        }
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));

                    sortArr.sort(function (a, b) {
                        return b.xp - a.xp;
                    });

                    function kFormatter(num) {
                        return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000 * 1).toFixed(0)) + 'K' : Math.sign(num) * Math.abs(num);

                    }

                    rankArr = [];
                    for (let i = 0; i < sortArr.length; i++) {
                        let exists = guild.members.cache.get(sortArr[i].id);

                        if (exists) {
                            xpkFormat = kFormatter(sortArr[i].xp);
                            rankArr.push({ id: sortArr[i].id, xp: xpkFormat });
                        }
                    }

                    response.addField(`:trophy: \`CreatorHub Rank Leaderboard\``, `⠀
🥇 <@${rankArr[0].id}> - **${rankArr[0].xp}** XP
🥈 <@${rankArr[1].id}> - **${rankArr[1].xp}** XP
🥉 <@${rankArr[2].id}> - **${rankArr[2].xp}** XP
\`4.\` <@${rankArr[3].id}> - **${rankArr[3].xp}** XP
\`5.\` <@${rankArr[4].id}> - **${rankArr[4].xp}** XP
\`6.\` <@${rankArr[5].id}> - **${rankArr[5].xp}** XP
\`7.\` <@${rankArr[6].id}> - **${rankArr[6].xp}** XP
\`8.\` <@${rankArr[7].id}> - **${rankArr[7].xp}** XP
\`9.\` <@${rankArr[8].id}> - **${rankArr[8].xp}** XP
\`10.\` <@${rankArr[9].id}> - **${rankArr[9].xp}** XP`, false)

                    interaction.editReply({
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
                            // do nothing
                        }
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));

                    let searchForRecord = 'currentRecord'
                    await mongo().then(async (mongoose) => {
                        try {
                            const results = await letterRecordSchema.find({ searchForRecord });
                            for (const info of results) {
                                const { letterRecord } = info;
                                const letterChannel = client.channels.cache.get(process.env.LL_CHAN);

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

                                            function kFormatter(num) {
                                                return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(2)) + 'K' : Math.sign(num) * Math.abs(num);
                                            }

                                            for (let i = 0; i < resultsArr.length; i++) {
                                                let exists = guild.members.cache.get(resultsArr[i].userId);

                                                if (exists) {
                                                    countkFormat = kFormatter(resultsArr[i].correctCount);
                                                    letterArr.push({ id: resultsArr[i].userId, count: countkFormat });
                                                }
                                            }

                                            let lllbEmbed = new MessageEmbed()
                                                .setColor('#32BEA6')
                                                .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
                                                .setTimestamp()
                                                .addField(`🏆 \`Last Letter Leaderboard\``, `⠀
🥇 <@${letterArr[0].id}> - **${letterArr[0].count}** points
🥈 <@${letterArr[1].id}> - **${letterArr[1].count}** points
🥉 <@${letterArr[2].id}> - **${letterArr[2].count}** points
\`4.\` <@${letterArr[3].id}> - **${letterArr[3].count}** points
\`5.\` <@${letterArr[4].id}> - **${letterArr[4].count}** points
\`6.\` <@${letterArr[5].id}> - **${letterArr[5].count}** points
\`7.\` <@${letterArr[6].id}> - **${letterArr[6].count}** points
\`8.\` <@${letterArr[7].id}> - **${letterArr[7].count}** points
\`9.\` <@${letterArr[8].id}> - **${letterArr[8].count}** points
\`10.\` <@${letterArr[9].id}> - **${letterArr[9].count}** points
        
Last submit by: ${lastSubmit}
Current level: **${gotCount}**
Record level: **${letterRecord}**`, false)

                                            const letterRecordEmbed = new MessageEmbed()
                                                .setColor('#32BEA6')
                                                .addField(`🔡 \`Last Letter Information\``, `Match the first letter of your word to the last letter of the previous word.
If the previous word was \`rabbit\`, then the next word would start with \`t\`, like \`tomato\`, and so on.
                                
The game gets progressively harder over time by increasing the minimum amount of characters you must use per word. Try to beat the record level found below!
⠀`, false)
                                                .addField(`💬 \`Chatting\``, `If you want to send messages in the channel without ruining the game, the bot will ignore messages that start with \`>\`, like \`> nice word!\` *(that is a greater-than sign followed by a space and then your message)*
⠀`, false)
                                                .addField(`📜 \`Rules\``, `- words must be in the English dictionary
- you can not play 2 words in a row, you'll need a friend to help
- you can not use a word that has already been used in the previous 10 messages
- you can only submit 1 word per message, more than 1 word will be deleted
- your word must not contain any numbers *(0-9)* or symbols *(!$#)*
⠀`, false)
                                                .addField(`🆙 \`Levels\``, `- level 20: four or more character words
- level 40: five or more character words
- level 80: six or more character words
- level 100: seven or more character words
- level 150: eight or more character words
⠀`, false)
                                                .addField(`🆙 \`Points System\``, `Each letter has a point value assigned to it. You can use the same letter multiple times in a word for a higher overall points.

**Q, Z** - 10 points
**J, X** - 8 points
**K** - 5 points
**F, H, V, W, Y** - 4 points
**B, C, M, P** - 3 points
**D, G** - 2 points
**A, E, I, O, N, R, T, L, S, U** - 1 point

So, if you played the word \`GOOD\` you would get a total of **6** points.
If you played the word \`EQUIVOCAL\` you would get a total of **23** points`, false)

                                            interaction.reply({
                                                embeds: [letterRecordEmbed, lllbEmbed],
                                                ephemeral: true
                                            }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));

                                        } finally {
                                            // do nothing
                                        }
                                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));
                                });
                            }
                        } finally {
                            // do nothing
                        }
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));
                }
            }

            switch (options.getSubcommand()) {
                case 'messages': {
                    await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

                    const response = new MessageEmbed()
                        .setColor('#32BEA6')
                        .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
                        .setTimestamp()

                    await mongo().then(async mongoose => {
                        const sort = await rankSchema.find({ rank: { $gte: 1, $lt: 50 } }).catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));

                        sortArr = [];
                        for (const data of sort) {
                            const { id, msgCount } = data;

                            sortArr.push({ id, msgCount });
                        }
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));

                    sortArr.sort(function (a, b) {
                        return b.msgCount - a.msgCount;
                    });

                    function kFormatter(num) {
                        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    }

                    msgCountArr = [];
                    for (let i = 0; i < sortArr.length; i++) {
                        let exists = guild.members.cache.get(sortArr[i].id);

                        if (exists) {
                            msgkFormat = kFormatter(sortArr[i].msgCount);
                            msgCountArr.push({ id: sortArr[i].id, xp: msgkFormat });
                        }
                    }

                    response.addField(`:trophy: \`CreatorHub Message Count Leaderboard\``, `⠀
🥇 <@${msgCountArr[0].id}> - **${msgCountArr[0].xp}** messages
🥈 <@${msgCountArr[1].id}> - **${msgCountArr[1].xp}** messages
🥉 <@${msgCountArr[2].id}> - **${msgCountArr[2].xp}** messages
\`4.\` <@${msgCountArr[3].id}> - **${msgCountArr[3].xp}** messages
\`5.\` <@${msgCountArr[4].id}> - **${msgCountArr[4].xp}** messages
\`6.\` <@${msgCountArr[5].id}> - **${msgCountArr[5].xp}** messages
\`7.\` <@${msgCountArr[6].id}> - **${msgCountArr[6].xp}** messages
\`8.\` <@${msgCountArr[7].id}> - **${msgCountArr[7].xp}** messages
\`9.\` <@${msgCountArr[8].id}> - **${msgCountArr[8].xp}** messages
\`10.\` <@${msgCountArr[9].id}> - **${msgCountArr[9].xp}** messages
\`11.\` <@${msgCountArr[10].id}> - **${msgCountArr[10].xp}** messages
\`12.\` <@${msgCountArr[11].id}> - **${msgCountArr[11].xp}** messages
\`13.\` <@${msgCountArr[12].id}> - **${msgCountArr[12].xp}** messages
\`14.\` <@${msgCountArr[13].id}> - **${msgCountArr[13].xp}** messages
\`15.\` <@${msgCountArr[14].id}> - **${msgCountArr[14].xp}** messages
\`16.\` <@${msgCountArr[15].id}> - **${msgCountArr[15].xp}** messages
\`17.\` <@${msgCountArr[16].id}> - **${msgCountArr[16].xp}** messages
\`18.\` <@${msgCountArr[17].id}> - **${msgCountArr[17].xp}** messages
\`19.\` <@${msgCountArr[18].id}> - **${msgCountArr[18].xp}** messages
\`20.\` <@${msgCountArr[19].id}> - **${msgCountArr[19].xp}** messages`, false)

                    interaction.editReply({
                        embeds: [response],
                        ephemeral: true
                    }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                }
            }

            switch (options.getSubcommand()) {
                case 'counting': {
                    await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

                    const countChan = client.channels.cache.get(process.env.COUNT_CHAN);

                    countChan.messages.fetch({ limit: 1 }).then(async fetched => {
                        fetched.forEach(msg => {
                            lastSubmit = msg.author;
                        });


                        const response = new MessageEmbed()
                            .setColor('#32BEA6')
                            .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
                            .setTimestamp()

                        await mongo().then(async mongoose => {
                            const sort = await countingSchema.find().catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));
                            const results = await countingCurrent.find().catch(err => console.error(`${path.basename(__filename)} There was a problem finding a database entry: `, err));

                            for (const countData of results) {
                                const { currentCount, currentRecord } = countData;

                                gotCount = currentCount;
                                countRecord = currentRecord;
                            }

                            sortArr = [];
                            for (const data of sort) {
                                const { userId, counts } = data;

                                sortArr.push({ userId, counts });
                            }
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem connecting to the database: `, err));

                        sortArr.sort(function (a, b) {
                            return b.counts - a.counts;
                        });

                        function kFormatter(num) {
                            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        }

                        countArr = [];
                        for (let i = 0; i < sortArr.length; i++) {
                            let exists = guild.members.cache.get(sortArr[i].userId);

                            if (exists) {
                                countkFormat = kFormatter(sortArr[i].counts);
                                countArr.push({ id: sortArr[i].userId, count: countkFormat });
                            }
                        }

                        response.addField(`:trophy: \`CreatorHub Counting Leaderboard\``, `⠀
🥇 <@${countArr[0]?.id}> - **${countArr[0]?.count}** correct counts
🥈 <@${countArr[1]?.id}> - **${countArr[1]?.count}** correct counts
🥉 <@${countArr[2]?.id}> - **${countArr[2]?.count}** correct counts
\`4.\` <@${countArr[3]?.id}> - **${countArr[3]?.count}** correct counts
\`5.\` <@${countArr[4]?.id}> - **${countArr[4]?.count}** correct counts
\`6.\` <@${countArr[5]?.id}> - **${countArr[5]?.count}** correct counts
\`7.\` <@${countArr[6]?.id}> - **${countArr[6]?.count}** correct counts
\`8.\` <@${countArr[7]?.id}> - **${countArr[7]?.count}** correct counts
\`9.\` <@${countArr[8]?.id}> - **${countArr[8]?.count}** correct counts
\`10.\` <@${countArr[9]?.id}> - **${countArr[9]?.count}** correct counts

Last submit by: ${lastSubmit}
Current level: **${gotCount}**
Record level: **${countRecord}**`, false)

                        interaction.editReply({
                            embeds: [response],
                            ephemeral: true
                        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
                    });
                }
            }
        } catch (err) {
            console.error(err);
        }
    }
}