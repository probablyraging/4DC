const { ContextMenuInteraction, MessageEmbed } = require('discord.js');
const { getRules } = require('../../../lists/rule-list');
const index = require('../../../lists/index');
const path = require('path');
const nowDate = new Date();

module.exports = {
	name: `index`,
	description: `Pre-written content for specific channels`,
	access: 'owner',
	cooldown: 0,
	type: 'CHAT_INPUT',
	options: [{
		name: `data`,
		description: `Data to send`,
		type: `STRING`,
		required: true,
		choices: [{ name: 'welcome', value: 'welcome' },
		{ name: 'rules', value: 'rules' },
		{ name: 'faq', value: 'faq' },
		{ name: 'creatorcrew', value: 'creatorcrew' },
		{ name: 'selfroles', value: 'selfroles' }]
	}],
	/**
	 * 
	 * @param {ContextMenuInteraction} interaction 
	 */
	async execute(interaction) {
		const { channel, client, options } = interaction;

		const avatarURL = client.user.avatarURL({ format: 'png', size: 256 });

		try {
			// WELCOME
			switch (options.getString('data')) {
				case 'welcome': {
					channel.createWebhook(client.user.username, { avatar: avatarURL }).then(webhook => {
						webhook.send(index.welcome[0])
							.catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err));
						setTimeout(() => {
							webhook.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook: `, err));
						}, 10000);
					}).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err));
				}

					interaction.reply({
						content: `${process.env.BOT_CONF} \`Done\``,
						ephemeral: true
					}).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
			}

			// RULES
			switch (options.getString('data')) {
				case 'rules': {
					getRules().then(rule => {
						channel.createWebhook(client.user.username, { avatar: avatarURL }).then(async webhook => {
							setTimeout(async () => {
								webhook.send(`**SERVER RULES**
To keep CreatorHub a safe and positive experience for everyone, you are required to follow [CreatorHub's Server Rules](<https://discord.com/channels/820889004055855144/898541066595209248>), [Discord's ToS](<https://discord.com/terms>) and [Discord's Community Guidelines](<https://discord.com/guidelines>)

> **1.** ${rule[0]}
> 
> **2.** ${rule[1]}
> 
> **3.** ${rule[2]}
> 
> **4.** ${rule[3].replace('<#${process.env.PREM_CHAN}>', `<#${process.env.PREM_CHAN}>`)}
> 
> **5.** ${rule[4]}
> 
> **6.** ${rule[5]}
> 
> **7.** ${rule[6]}

*last updated: ${nowDate.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}*`).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err));
							}, 1000);
							setTimeout(() => {
								webhook.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook: `, err));
							}, 10000);
						}).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err));
					});

				}

					interaction.reply({
						content: `${process.env.BOT_CONF} \`Done\``,
						ephemeral: true
					}).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
			}

			// FAQ
			switch (options.getString('data')) {
				case 'faq': {
					await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

					channel.createWebhook(client.user.username, { avatar: avatarURL }).then(webhook => {
						for (let i = 0; i < index.faq.length; i++) {
							setTimeout(function () {
								webhook.send({
									content: `${index.faq[i]}`,
									allowedMentions: {
										parse: []
									}
								}).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook message: `, err));
							}, i * 1000);
						}
						setTimeout(() => {
							webhook.delete().catch(err => console.error(`${path.basename(__filename)} There was a problem deleting a webhook: `, err));
						}, 10000);
					}).catch(err => console.error(`${path.basename(__filename)} There was a problem sending a webhook: `, err));
				}

					interaction.editReply({
						content: `${process.env.BOT_CONF} \`Done\``,
						ephemeral: true
					}).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
			}

			// CREATOR CREW
			switch (options.getString('data')) {
				case 'creatorcrew': {
					const response = new MessageEmbed()
						.setColor('#32BEA6')
						.setDescription(`${index.creatorcrew}`)

					channel.send({
						embeds: [response]
					}).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an embed: `, err));
				}

					interaction.reply({
						content: `${process.env.BOT_CONF} \`Done\``,
						ephemeral: true
					}).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
			}

			// SELF ROLES
			switch (options.getString('data')) {
				case 'selfroles': {
					await interaction.deferReply({ ephemeral: true }).catch(err => console.error(`${path.basename(__filename)} There was a problem deferring an interaction: `, err));

					const response1 = new MessageEmbed()
						.setColor('#32BEA6')
						.setTitle(`**\`Nickname Colors\`**`)
						.setDescription(`Click a reaction below to change your nickname color`)

					const response2 = new MessageEmbed()
						.setColor('#32BEA6')
						.setTitle(`**\`Choose Your Platforms\`**`)
						.setDescription(`<:twitch:837083090283003964> - Twitch
<:youtube:837083090441994240> - YouTube
<:instagram:837325424744595466> - Instagram
<:tiktok:837325423712796762> - TikTok`)

					const response3 = new MessageEmbed()
						.setColor('#32BEA6')
						.setTitle(`**\`Choose Your Age\`**`)
						.setDescription(`:baby: - 13-17
:boy: - 18-29
:man: - 30+`)

					const response4 = new MessageEmbed()
						.setColor('#32BEA6')
						.setTitle(`**\`Choose Your Region\`**`)
						.setDescription(`:one: - America
:two: - Europe
:three: - Oceania
:four: - Asia`)

					const response5 = new MessageEmbed()
						.setColor('#32BEA6')
						.setTitle(`**\`Choose Your Gender\`**`)
						.setDescription(`:man_raising_hand: - Male
:woman_raising_hand: - Female
:person_raising_hand: - Non-binary`)

					const response6 = new MessageEmbed()
						.setColor('#32BEA6')
						.setTitle(`**\`Optional Ping Roles\`**`)
						.setDescription(`:loudspeaker: - Announcements | *giveaways, new channels etc*
:game_die: - Game Deals | *bot ping for <#846449072105586708>*
:mega: - Disboard Bump | *bot ping for <#855427926136193054>*`)

					const res1 = await channel.send({ embeds: [response1] }).catch(err => console.error(`Could not send a message: `, err));
					await res1.react("🔵").catch(err => console.error(`Could not react to message: `, err));
					await res1.react("🔴").catch(err => console.error(`Could not react to message: `, err));
					await res1.react("🟢").catch(err => console.error(`Could not react to message: `, err));
					await res1.react("🟠").catch(err => console.error(`Could not react to message: `, err));
					await res1.react("🟡").catch(err => console.error(`Could not react to message: `, err));
					await res1.react("🟣").catch(err => console.error(`Could not react to message: `, err));
					await res1.react("🌸").catch(err => console.error(`Could not react to message: `, err));

					const res2 = await channel.send({ content: '⠀', embeds: [response2] }).catch(err => console.error(`Could not send a message: `, err));
					await res2.react("<:twitch:837083090283003964>").catch(err => console.error(`Could not react to message: `, err));
					await res2.react("<:youtube:837083090441994240>").catch(err => console.error(`Could not react to message: `, err));
					await res2.react("<:instagram:837325424744595466>").catch(err => console.error(`Could not react to message: `, err));
					await res2.react("<:tiktok:837325423712796762>").catch(err => console.error(`Could not react to message: `, err));

					const res3 = await channel.send({ content: '⠀', embeds: [response3] }).catch(err => console.error(`Could not send a message: `, err));
					await res3.react("👶").catch(err => console.error(`Could not react to message: `, err));
					await res3.react("👦").catch(err => console.error(`Could not react to message: `, err));
					await res3.react("👨").catch(err => console.error(`Could not react to message: `, err));

					const res4 = await channel.send({ content: '⠀', embeds: [response4] }).catch(err => console.error(`Could not send a message: `, err));
					await res4.react("1️⃣").catch(err => console.error(`Could not react to message: `, err));
					await res4.react("2️⃣").catch(err => console.error(`Could not react to message: `, err));
					await res4.react("3️⃣").catch(err => console.error(`Could not react to message: `, err));
					await res4.react("4️⃣").catch(err => console.error(`Could not react to message: `, err));

					const res5 = await channel.send({ content: '⠀', embeds: [response5] }).catch(err => console.error(`Could not send a message: `, err));
					await res5.react("🙋‍♂️").catch(err => console.error(`Could not react to message: `, err));
					await res5.react("🙋‍♀️").catch(err => console.error(`Could not react to message: `, err));
					await res5.react("🙋").catch(err => console.error(`Could not react to message: `, err));

					const res6 = await channel.send({ content: '⠀', embeds: [response6] }).catch(err => console.error(`Could not send a message: `, err));
					await res6.react("📢").catch(err => console.error(`Could not react to message: `, err));
					await res6.react("🎲").catch(err => console.error(`Could not react to message: `, err));
					await res6.react("📣").catch(err => console.error(`Could not react to message: `, err));
				}

					interaction.editReply({
						content: `${process.env.BOT_CONF} \`Done\``,
						ephemeral: true
					}).catch(err => console.error(`${path.basename(__filename)} There was a problem sending an interaction: `, err));
			}
		} catch (err) {
			console.error(err);
		}
	}
}