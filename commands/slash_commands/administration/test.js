const ccVideoQueue = require('../../../schemas/creator_crew/video_queue');
const { ContextMenuInteraction, MessageActionRow, MessageSelectMenu } = require("discord.js");

module.exports = {
	name: `test`,
	description: `dummy command`,
	cooldown: 0,
	type: 'CHAT_INPUT',
	/**
	 * 
	 * @param {ContextMenuInteraction} interaction 
	 */
	async execute(interaction, client) {
		const { options, member, guild, channel } = interaction;

		const select1 = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId('color-select')
					.setPlaceholder('Pick a nickname color')
					.addOptions([
						{
							label: 'Blue',
							value: 'blue',
						},
						{
							label: 'Red',
							value: 'red',
						},
						{
							label: 'Green',
							value: 'green',
						},
						{
							label: 'Orange',
							value: 'orange',
						},
						{
							label: 'Yellow',
							value: 'yellow',
						},
						{
							label: 'Pink',
							value: 'pink',
						},
						{
							label: 'Purple',
							value: 'purple',
						}
					]),
			);

		channel.send({ content: 'Pong!', components: [row] });

		interaction.reply({ content: 'done', ephemeral: true });
	}
}