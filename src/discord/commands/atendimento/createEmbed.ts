import { Command, URLStore } from "#base";
import { createEmbed } from "@magicyan/discord";
// import { createRow } from "@magicyan/discord";
import { ApplicationCommandType, ButtonBuilder, ButtonStyle, TextChannel, ActionRowBuilder, ComponentType } from "discord.js";

new Command({
    name: "novoticket",
    description: "Envie isso para abrir um novo Chamado 🎫",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        // Armazenar o channelId e o ticket no URLStore
        const urlStore = new URLStore();
        urlStore.set("channelId", interaction.channelId);
        urlStore.set("ticket", interaction.user.id);

        // Criar o embed
        const embed = createEmbed({
            title: "**🛍️ Solicitar Atendimento Para o Compras 🛒**",
            description: "**Iniciando um Atendimento:** 🎫\n\nPara utilizar do atendimento do Compras clique no botão " + "Compras 🛒" + " e selecione a opção desejada, sendo elas listadas à seguir.\n\n**Previsão de Chegada:** ✅\n\nAo clicar nessa opção, será aberto um formulário em que você deverá digitar o código do produto que deseja saber a previsão de chegada.\n\n**Novos Produtos:** 🛍️\n\nAo ser selecionado, será aberto um formulário que ao ser preenchido criará um canal de texto em que você poderá conversar com o compras.\n\n**Falar com o Compras 🛒**:\n\nAo clicar nesse botão será criado um canal de texto em que você conversará diretemente com o compras caso nenhuma das opções anteriores satisfaça a sua necessidade de atendimento.",
            color: 0x00FF00, // Cor verde
            url: "https://discord.com/channels/1298349395091132458/1298349543368163328" // URL do canal
        });

        // Botão para abrir um novo chamado
        // let button = new ButtonBuilder()
        //     .setCustomId("newTicket")
        //     .setLabel("Abrir um novo Chamado +")
        //     .setStyle(ButtonStyle.Success);
        
        const button = new ButtonBuilder({ 
                customId: `compras`,
                label: "Compras 🛒",
                style: ButtonStyle.Success
            })
        

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(button);

        // Enviar o embed para um canal específico (use o ID real do canal)
        const channel = await interaction.client.channels.fetch("1298349543368163328") as TextChannel;
        if (channel) {
            const sentMessage = await channel.send({ embeds: [embed], components: [row] });

            
        }

        // Responder de forma invisível para o usuário que executou o comando
        interaction.reply({ ephemeral: true, content: "Embed fixado no canal com sucesso!" });
    }
});