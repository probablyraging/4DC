const { ContextMenuInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, SelectMenuBuilder } = require('discord.js');
const { getRules } = require('../../../lists/rule-list');
const index = require('../../../lists/index');
const path = require('path');
const nowDate = new Date();

module.exports = {
	name: `index`,
	description: `Pre-written content for specific channels`,
	access: 'owner',
	cooldown: 0,
	type: ApplicationCommandType.ChatInput,
	options: [{
		name: `data`,
		description: `Data to send`,
		type: ApplicationCommandOptionType.String,
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

		const avatarURL = await client.user.avatarURL({ format: 'png', size: 256 });

		try {
			// WELCOME
			switch (options.getString('data')) {
				case 'welcome': {
					channel.createWebhook({ name: client.user.username, avatar: `${avatarURL}` }).then(webhook => {
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
						channel.createWebhook({ name: client.user.username, avatar: `${avatarURL}` }).then(async webhook => {
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

					channel.createWebhook({ name: client.user.username, avatar: `${avatarURL}` }).then(webhook => {
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
					const response = new EmbedBuilder()
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

					const response1 = new EmbedBuilder()
						.setColor('#32BEA6')
						.setTitle(`**\`Nickname Colors\`**`)
						.setDescription(`Choose your nickname color below`)

					const select1 = new ActionRowBuilder()
						.addComponents(
							new SelectMenuBuilder()
								.setCustomId('color-select')
								.setPlaceholder('Select')
								.addOptions([
									{ label: 'Blue', value: 'blue', emoji: '996661870461210655' },
									{ label: 'Red', value: 'red', emoji: '996661868011716670' },
									{ label: 'Green', value: 'green', emoji: '996661865784545302' },
									{ label: 'Orange', value: 'orange', emoji: '996661864371081336' },
									{ label: 'Yellow', value: 'yellow', emoji: '996661862714327080' },
									{ label: 'Pink', value: 'pink', emoji: '996661860080304138' },
									{ label: 'Purple', value: 'purple', emoji: '996661858025099275' }
								]),
						);

					const response2 = new EmbedBuilder()
						.setColor('#32BEA6')
						.setTitle(`**\`Choose Your Platforms\`**`)
						.setDescription(`<:twitch:837083090283003964> - Twitch
<:youtube:837083090441994240> - YouTube
<:instagram:837325424744595466> - Instagram
<:tiktok:837325423712796762> - TikTok`)

					const select2 = new ActionRowBuilder()
						.addComponents(
							new SelectMenuBuilder()
								.setCustomId('platform-select')
								.setPlaceholder('Select')
								.addOptions([
									{ label: 'Twitch', value: 'twitch', emoji: '837083090283003964' },
									{ label: 'YouTube', value: 'youtube', emoji: '837083090441994240' },
									{ label: 'Instagram', value: 'instagram', emoji: '837325424744595466' },
									{ label: 'TikTok', value: 'tiktok', emoji: '837325423712796762' }
								]),
						);

					const response3 = new EmbedBuilder()
						.setColor('#32BEA6')
						.setTitle(`**\`Choose Your Age\`**`)
						.setDescription(`:baby: - 13-17
:boy: - 18-29
:man: - 30+`)

					const select3 = new ActionRowBuilder()
						.addComponents(
							new SelectMenuBuilder()
								.setCustomId('age-select')
								.setPlaceholder('Select')
								.addOptions([
									{ label: '13-17', value: '13-17', emoji: '👶' },
									{ label: '18-29', value: '18-29', emoji: '👦' },
									{ label: '30+', value: '30+', emoji: '👨' }
								]),
						);

					const response4 = new EmbedBuilder()
						.setColor('#32BEA6')
						.setTitle(`**\`Choose Your Region\`**`)
						.setDescription(`:football: - America
:ferris_wheel: - Europe
:island: - Oceania
:izakaya_lantern: - Asia`)

					const select4 = new ActionRowBuilder()
						.addComponents(
							new SelectMenuBuilder()
								.setCustomId('region-select')
								.setPlaceholder('Select')
								.addOptions([
									{ label: 'America', value: 'america', emoji: '🏈' },
									{ label: 'Europe', value: 'europe', emoji: '🎡' },
									{ label: 'Oceania', value: 'oceania', emoji: '🏝️' },
									{ label: 'Asia', value: 'asia', emoji: '🐉' },
									{ label: 'Africa', value: 'africa', emoji: '🦁' }
								]),
						);

					const response5 = new EmbedBuilder()
						.setColor('#32BEA6')
						.setTitle(`**\`Choose Your Gender\`**`)
						.setDescription(`:man_raising_hand: - Male
:woman_raising_hand: - Female
:person_raising_hand: - Non-binary`)

					const select5 = new ActionRowBuilder()
						.addComponents(
							new SelectMenuBuilder()
								.setCustomId('gender-select')
								.setPlaceholder('Select')
								.addOptions([
									{ label: 'Male', value: 'male', emoji: '🙋‍♂️' },
									{ label: 'Female', value: 'female', emoji: '🙋‍♀️' },
									{ label: 'Non-binary', value: 'non-binary', emoji: '🙋' }
								]),
						);

					const response6 = new EmbedBuilder()
						.setColor('#32BEA6')
						.setTitle(`**\`Optional Ping Roles\`**`)
						.setDescription(`:loudspeaker: - Announcements | *giveaways, new channels etc*
:game_die: - Game Deals | *bot ping for <#846449072105586708>*
:mega: - Disboard Bump | *bot ping for <#855427926136193054>*`)

					const select6 = new ActionRowBuilder()
						.addComponents(
							new SelectMenuBuilder()
								.setCustomId('custom-select')
								.setPlaceholder('Select')
								.addOptions([
									{ label: 'Announcements', value: 'announcements', emoji: '📢' },
									{ label: 'Game Deals', value: 'deals', emoji: '🎲' },
									{ label: 'Disboard Bump', value: 'bump', emoji: '📣' }
								]),
						);

					await channel.send({ content: '**Choose your nickname color**', components: [select1] }).catch(err => console.error(`Could not send a message: `, err));

					await channel.send({
						content: `⠀
**Choose your platforms**`, components: [select2]
					}).catch(err => console.error(`Could not send a message: `, err));

					await channel.send({
						content: `⠀
**Choose your age**`, components: [select3]
					}).catch(err => console.error(`Could not send a message: `, err));

					await channel.send({
						content: `⠀
**Choose your region**`, components: [select4]
					}).catch(err => console.error(`Could not send a message: `, err));

					await channel.send({
						content: `⠀
**Choose your gender**`, components: [select5]
					}).catch(err => console.error(`Could not send a message: `, err));

					await channel.send({
						content: `⠀
**Choose your optional pings**`, components: [select6]
					}).catch(err => console.error(`Could not send a message: `, err));
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