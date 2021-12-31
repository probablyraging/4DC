const emojis = require("../lists/role-emojis");

const selfRoleReactions = {
    "Platforms": {
        "messageId": process.env.SELF_ROLES_PLATFORM_ID,
        "exclusive": false,
        "roleIds": {
            "twitch": emojis.twitch,
            "youtube": emojis.youtube,
            "instagram": emojis.instagram,
            "tiktok": emojis.tiktok
        }
    },
    "NicknameColor": {
        "messageId": process.env.SELF_ROLES_NICKNAME_COLOR_ID,
        "exclusive": true,
        "roleIds": {
            "🔵": emojis.a,
            "🔴": emojis.b,
            "🟢": emojis.c,
            "🟠": emojis.d,
            "🟡": emojis.e,
            "🌸": emojis.f,
            "🟣": emojis.g
        }
    },
    "Age": {
        "messageId": process.env.SELF_ROLES_AGE_ID,
        "exclusive": true,
        "roleIds": {
            "👶": emojis.h,
            "👦": emojis.i,
            "👨": emojis.j
        }
    },
    "Region": {
        "messageId": process.env.SELF_ROLES_REGION_ID,
        "exclusive": true,
        "roleIds": {
            "1️⃣": emojis.k,
            "2️⃣": emojis.l,
            "3️⃣": emojis.m,
            "4️⃣": emojis.n
        }
    },
    "Gender": {
        "messageId": process.env.SELF_ROLES_GENDER_ID,
        "exclusive": true,
        "roleIds": {
            "🙋‍♂️": emojis.o,
            "🙋‍♀️": emojis.p,
            "🙋": emojis.q
        }
    },
    "Custom": {
        "messageId": process.env.SELF_ROLES_CUSTOM_ID,
        "exclusive": false,
        "roleIds": {
            "📢": emojis.r,
            "🎲": emojis.s,
            "📣": emojis.t
        }
    }
};

module.exports = {
    selfRoleReactions
}
