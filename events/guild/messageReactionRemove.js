require("dotenv").config();
const selfRoleReactions = require("../../objects/selfRoleReactions");

module.exports = {
    name: "messageReactionRemove",
    async execute(reaction, user, client) {
        // We don't care if a bot reacts
        if (user.bot) {
            return;
        }

        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error("Could not fetch the message from the reaction:", error);
                return;
            }
        }

        let message = reaction.message;
        // We only listen for reactions in the self-roles channel
        if (process.env.SELFROLE_CHAN === message.channel.id) {
            let emoji = reaction.emoji;
            const guild = client.guilds.cache.get(process.env.GUILD_ID);
            const member = guild.members.cache.find(member => member.id === user.id);
            if (member) {
                for (let reactionKey in selfRoleReactions) {
                    if (selfRoleReactions.hasOwnProperty(reactionKey)) {
                        let selfRoleMessage = selfRoleReactions[reactionKey];
                        for (let reactionClass in selfRoleMessage) {
                            let selfRoleClass = selfRoleMessage[reactionClass];
                            // Check if we have the right message from self-roles
                            if (selfRoleClass.messageId === message.id) {
                                for (let roleIdKey in selfRoleClass.roleIds) {
                                        let roleId = selfRoleClass.roleIds[roleIdKey];
                                        if (roleIdKey === emoji.name) {
                                            member?.roles.remove(roleId);
                                            break;
                                        }
                                }
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
};