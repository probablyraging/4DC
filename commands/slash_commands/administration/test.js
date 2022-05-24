const { MessageEmbed, MessageSelectMenu, ContextMenuInteraction, MessageActionRow, TextInputComponent, Modal } = require('discord.js');
const { addCooldown, hasCooldown, removeCooldown } = require("../../../modules/misc/report_cooldown");
const { v4: uuidv4 } = require("uuid");
const warnSchema = require('../../../schemas/misc/warn_schema');
const { resArr } = require('../../../lists/rule-list');
const mongo = require('../../../mongo');
const ruleSchema = require('../../../schemas/misc/rule_schema');
const { getRules } = require('../../../lists/rule-list');

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
		const { options, member, guild } = interaction;

		const replace = '\` '

		getRules().then(rule => {
			
		});

	}
}