const { ContextMenuInteraction, MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');
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
						.setDescription(`Choose your nickname color below`)

					const select1 = new MessageActionRow()
						.addComponents(
							new MessageSelectMenu()
								.setCustomId('color-select')
								.setPlaceholder('Choose your nickname color')
								.addOptions([
									{ label: 'Blue', value: 'blue', emoji: '🔵' },
									{ label: 'Red', value: 'red', emoji: '🔴' },
									{ label: 'Green', value: 'green', emoji: '🟢' },
									{ label: 'Orange', value: 'orange', emoji: '🟠' },
									{ label: 'Yellow', value: 'yellow', emoji: '🟡' },
									{ label: 'Pink', value: 'pink', emoji: '🌸' },
									{ label: 'Purple', value: 'purple', emoji: '🟣' }
								]),
						);

					const response2 = new MessageEmbed()
						.setColor('#32BEA6')
						.setTitle(`**\`Choose Your Platforms\`**`)
						.setDescription(`<:twitch:837083090283003964> - Twitch
<:youtube:837083090441994240> - YouTube
<:instagram:837325424744595466> - Instagram
<:tiktok:837325423712796762> - TikTok`)

					const select2 = new MessageActionRow()
						.addComponents(
							new MessageSelectMenu()
								.setCustomId('platform-select')
								.setPlaceholder('Choose your platforms')
								.addOptions([
									{ label: 'Twitch', value: 'twitch', emoji: '837083090283003964' },
									{ label: 'YouTube', value: 'youtube', emoji: '837083090441994240' },
									{ label: 'Instagram', value: 'instagram', emoji: '837325424744595466' },
									{ label: 'TikTok', value: 'tiktok', emoji: '837325423712796762' }
								]),
						);

					const response3 = new MessageEmbed()
						.setColor('#32BEA6')
						.setTitle(`**\`Choose Your Age\`**`)
						.setDescription(`:baby: - 13-17
:boy: - 18-29
:man: - 30+`)

					const select3 = new MessageActionRow()
						.addComponents(
							new MessageSelectMenu()
								.setCustomId('age-select')
								.setPlaceholder('Choose your age')
								.addOptions([
									{ label: '13-17', value: '13-17', emoji: '👶' },
									{ label: '18-29', value: '18-29', emoji: '👦' },
									{ label: '30+', value: '30+', emoji: '👨' }
								]),
						);

					const response4 = new MessageEmbed()
						.setColor('#32BEA6')
						.setTitle(`**\`Choose Your Region\`**`)
						.setDescription(`:football: - America
:ferris_wheel: - Europe
:island: - Oceania
:izakaya_lantern: - Asia`)

					const select4 = new MessageActionRow()
						.addComponents(
							new MessageSelectMenu()
								.setCustomId('region-select')
								.setPlaceholder('Choose your region')
								.addOptions([
									{ label: 'America', value: 'america', emoji: '🏈' },
									{ label: 'Europe', value: 'europe', emoji: '🎡' },
									{ label: 'Oceania', value: 'oceania', emoji: '🏝️' },
									{ label: 'Asia', value: 'asia', emoji: '🏮' }
								]),
						);

					const response5 = new MessageEmbed()
						.setColor('#32BEA6')
						.setTitle(`**\`Choose Your Gender\`**`)
						.setDescription(`:man_raising_hand: - Male
:woman_raising_hand: - Female
:person_raising_hand: - Non-binary`)

					const select5 = new MessageActionRow()
						.addComponents(
							new MessageSelectMenu()
								.setCustomId('gender-select')
								.setPlaceholder('Choose your gender')
								.addOptions([
									{ label: 'Male', value: 'male', emoji: '🙋‍♂️' },
									{ label: 'Female', value: 'female', emoji: '🙋‍♀️' },
									{ label: 'Non-binary', value: 'non-binary', emoji: '🙋' }
								]),
						);

					const response6 = new MessageEmbed()
						.setColor('#32BEA6')
						.setTitle(`**\`Optional Ping Roles\`**`)
						.setDescription(`:loudspeaker: - Announcements | *giveaways, new channels etc*
:game_die: - Game Deals | *bot ping for <#846449072105586708>*
:mega: - Disboard Bump | *bot ping for <#855427926136193054>*`)

					const select6 = new MessageActionRow()
						.addComponents(
							new MessageSelectMenu()
								.setCustomId('custom-select')
								.setPlaceholder('Choose your optional pings')
								.addOptions([
									{ label: 'Announcements', value: 'announcements', emoji: '🙋‍♂️' },
									{ label: 'Game Deals', value: 'deals', emoji: '🙋‍♀️' },
									{ label: 'Disboard Bump', value: 'bump', emoji: '🙋' }
								]),
						);

					await channel.send({ embeds: [response1], components: [select1] }).catch(err => console.error(`Could not send a message: `, err));

					await channel.send({ content: '⠀', embeds: [response2], components: [select2] }).catch(err => console.error(`Could not send a message: `, err));

					await channel.send({ content: '⠀', embeds: [response3], components: [select3] }).catch(err => console.error(`Could not send a message: `, err));

					await channel.send({ content: '⠀', embeds: [response4], components: [select4] }).catch(err => console.error(`Could not send a message: `, err));

					await channel.send({ content: '⠀', embeds: [response5], components: [select5] }).catch(err => console.error(`Could not send a message: `, err));

					await channel.send({ content: '⠀', embeds: [response6], components: [select6] }).catch(err => console.error(`Could not send a message: `, err));
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