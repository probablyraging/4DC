const mongo = require('../mongo');
const ruleSchema = require('../schemas/misc/rule_schema');


async function getRules() {
    let resArr = [];
    await mongo().then(async mongoose => {
        const results = await ruleSchema.find();
        results.forEach(result => {
            resArr.push(result.value)
        })
    });
    return resArr;
}

module.exports = {
    getRules
}




// module.exports = {
//     img: 'https://i.imgur.com/vYaHwwJ.png',

//     pre: `To keep CreatorHub a safe and positive experience for everyone, you are required to follow [CreatorHub's Server Rules](<https://discord.com/channels/820889004055855144/898541066595209248>), [Discord's ToS](<https://discord.com/terms>) and [Discord's Community Guidelines](<https://discord.com/guidelines>)`,

//     rules: [
//         "Posts, usernames, avatars, profiles or linked accounts containing viruses, discriminatory, obscene, violent, profane, pornographic, sexually suggestive or nude content has no place in this server. This may result in a ban without warning",
//         "Do not spam or flood any channels. This means sending multiple messages rapidly or sending purposeless messages in an attempt to gain XP/Rank",
//         "Do not post self promotional content outside of the 'CONTENT SHARE' section. This includes sending other server members unsolicited DMs containing promotional content, server invites or spam",
//         `Advertising of other discord servers, offering or requesting paid services and products, or promotional content not related to content creation is only permitted in <#${process.env.PREM_CHAN}>`,
//         "We do not allow sub4sub type posts anywhere on the server, including the 'CONTENT SHARE' section. This is also against [YouTube's ToS](<https://support.google.com/youtube/answer/3399767?hl=en>)",
//         "Do not openly discuss or ask staff about other member's bans, mutes, message deletions, or other moderating actions",
//         "For moderating purposes, please keep your messages in English",
//         `*last updated: 01/05/2022*`
//     ]
// }