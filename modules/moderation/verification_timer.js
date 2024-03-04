
export default async (member, client) => {
    // Give the user 5 minutes to verify themselves, or kick them
    const timeToKick = Math.round((new Date().valueOf() + 300000) / 1000);
    member.send({
        content: `## Please Verify Yourself \nYou can verify yourself by going to <#1162008778061905992> and following the prompts \nYou will be kicked from the server <t:${timeToKick}:R> if you do not verify in time \n\n*ContentCreator Server Staff*`
    }).catch(() => { });
    setTimeout(() => {
        if (member && member.roles.cache.has(process.env.UNVERIFIED_ROLE)) {
            member.kick('Did not verify in time').catch(err => console.error(`There was a problem kicking a user from the server: `, err));
        }
    }, 300000);
}