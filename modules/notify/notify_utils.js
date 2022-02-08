const path = require("path");
const {GuildMember, User, TextChannel} = require("discord.js");

/**
 * @param {GuildMember | User} member The Discord.GuildMember or Discord.User to notify
 * @param {String} message The message to send to the user
 * @param {TextChannel | null} backupChannel A backup channel to send the message to if the user cannot be DM'd, or null
 */
function notifyUser(member, message, backupChannel) {
    member.send(message)
        .catch(err => {
            console.error(`${path.basename(__filename)} There was a problem DMing the guild member: `, err);
            if (backupChannel) {
                backupChannel.send(message)
                    .catch(err => console.error(`${path.basename(__filename)} There was a problem sending a channel message: `, err));
            }
        });
}

module.exports = {
    notifyUser
};
