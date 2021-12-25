const { Message } = require('discord.js');
const path = require('path');
/**
 * 
 * @param {Message} message 
 */
module.exports = (message, client, Discord) => {
    let msgAttachment = message?.attachments.size > 0 ? message?.attachments.first().proxyURL : null;

    // when someone uses !rank, mee6 replies with an attachment. we delete that reply and resend the attachment
    if (msgAttachment && message?.author.id === process.env.MEE6_ID && message?.channel.id === process.env.BOT_CHAN) {
        const msgAttachment = message?.attachments.size > 0 ? message?.attachments : null;

        const image = msgAttachment.first().url;

        message?.channel.send({
            content: ` `,
            files: [image]
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a message: `, err));

        message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
    }

    // when someone levels up, mee6 sends a message. we hijack that message and apply roles when neccessary
    if (message?.author.id === process.env.MEE6_ID && message?.content.startsWith('GG') && message?.channel.id === process.env.BOT_CHAN) {
        message?.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));
        message?.channel.send({
            content: `${message?.content}`
        }).catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a message: `, err));

        let target = message?.mentions.members.first();

        let verified = message?.guild.roles.cache.find(r => r.id === process.env.VERIFIED_ROLE);

        let lv5 = message?.guild.roles.cache.get(process.env.RANK5_ROLE);
        let lv10 = message?.guild.roles.cache.get(process.env.RANK10_ROLE);
        let lv15 = message?.guild.roles.cache.get(process.env.RANK15_ROLE);
        let lv20 = message?.guild.roles.cache.get(process.env.RANK20_ROLE);
        let lv25 = message?.guild.roles.cache.get(process.env.RANK25_ROLE);
        let lv30 = message?.guild.roles.cache.get(process.env.RANK30_ROLE);

        if (!message?.content.includes('you just advanced to level') && !target) return;

        if (message?.content.includes(` 5!`)) {
            target?.roles.add(lv5)
                .catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));
        } else if (message?.content.includes(` 10!`)) {
            target?.roles.remove(lv5).catch(err => { return; })            
                .catch(err => console.error(`${path.basename(__filename)} There was a problem removing a role: `, err));

            target?.roles.add(lv10).catch(err => { return; })
                .catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));

            target?.roles.add(verified).catch(err => { return; })
                .catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));
        } else if (message?.content.includes(` 15!`)) {
            target?.roles.remove(lv10).catch(err => { return; })
                .catch(err => console.error(`${path.basename(__filename)} There was a problem removing a role: `, err));

            target?.roles.add(lv15).catch(err => { return; })
                .catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));                
        } else if (message?.content.includes(` 20!`)) {
            target?.roles.remove(lv15).catch(err => { return; })
                .catch(err => console.error(`${path.basename(__filename)} There was a problem removing a role: `, err));

            target?.roles.add(lv20).catch(err => { return; })
                .catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));
        } else if (message?.content.includes(` 25!`)) {
            target?.roles.remove(lv20).catch(err => { return; })
                .catch(err => console.error(`${path.basename(__filename)} There was a problem removing a role: `, err));

            target?.roles.add(lv25).catch(err => { return; })
                .catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));
        } else if (message?.content.includes(` 30!`)) {
            target?.roles.remove(lv25).catch(err => { return; })
                .catch(err => console.error(`${path.basename(__filename)} There was a problem removing a role: `, err));

            target?.roles.add(lv30).catch(err => { return; })
                .catch(err => console.error(`${path.basename(__filename)} There was a problem adding a role: `, err));
        }
    }
}