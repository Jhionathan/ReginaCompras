import { Command } from "#base";
import { createRow } from "@magicyan/discord";
import { ApplicationCommandType, ButtonBuilder, ButtonStyle } from "discord.js";

new Command({
	name: "compras",
	description: "Sua assistente de compras 🛒",
	type: ApplicationCommandType.ChatInput,
	run(interaction){
		const row = createRow(
			new ButtonBuilder({ 
				customId: `compras`,
				label: "Compras 🛒",
				style: ButtonStyle.Success
			})
		);
		interaction.reply({ ephemeral, content: "🛒", components: [row] });
	}
});