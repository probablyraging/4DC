const url = "https://discord.com/channels/${process.env.GUILD_ID}/${process.env.PREM_CHAN}";

module.exports = {
    rules: [
        "Harmful posts, usernames, nicknames, avatars, profiles or linked accounts containing viruses, pornographic, discriminatory or violent content has no place in this server. This may result in a ban without warning",        
        "Do not spam or flood any channels. This means sending multiple messages rapidly or sending purposeless messages in an attempt to gain XP/Rank",
        "Do not post self promotional content outside of the ‘SELF PROMOTE’ section. This includes sending other server members unsolicited DMs containing promotional content, server invites or spam",
        "Advertising of other discord servers, paid services and products, or promotional content not related to content creation is only permitted in [#premium-ads](${url})",
        "We do not condone sub4sub type behaviour anywhere on the server, including the ‘SELF PROMOTE’ section. This is also against [YouTube’s ToS](<https://support.google.com/youtube/answer/3399767?hl=en>)",
        "Do not openly discuss or ask staff about other member's bans, mutes, message deletions, or other moderating actions",
        "For moderating purposes, please keep your messages in English"
    ]
}