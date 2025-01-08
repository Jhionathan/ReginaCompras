import { Command, URLStore } from "#base";
import { createEmbed } from "@magicyan/discord";
// import { createRow } from "@magicyan/discord";
import { ApplicationCommandType, ButtonBuilder, ButtonStyle, TextChannel, ActionRowBuilder } from "discord.js";

new Command({
    name: "novoembed",
    description: "Envie isso para abrir um novo Chamado 🎫",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const allowedRoleId = "1288150802283757599"; // Substitua pelo ID do cargo permitido

            // Verifica se o usuário tem o cargo permitido
            const member = interaction.member;
            if (!member.roles.cache.has(allowedRoleId)) {
                await interaction.reply({
                    content: "Você não tem permissão para usar este comando.",
                    ephemeral: true,
                });
                return;
            }

        // Armazenar o channelId e o ticket no URLStore
        const urlStore = new URLStore();
        urlStore.set("channelId", interaction.channelId);
        urlStore.set("ticket", interaction.user.id);

        // Criar o embed
        const embed = createEmbed({
            title: "**🛍️ Solicitar Atendimento para a REGINA-COMPRAS 🤖✨🛒**",
            description: "**Iniciando um Atendimento:** 🎫\n\nPara utilizar o atendimento do Compras, clique no botão " + "Atendimento Compras 🛒" + " e selecione a opção desejada. As opções disponíveis são as seguintes:\n\n**Previsão de Chegada:** ✅\n\nAo clicar nesta opção, será aberto um formulário onde você poderá digitar o código do produto para saber a previsão de chegada.\n\n**Novos Produtos:** 🛍️\n\nAo selecionar esta opção, será aberto um formulário que, ao ser preenchido, criará um canal de texto onde você poderá conversar diretamente com o setor de Compras.\n\n**Falar com o Compras 🛒**\n\nAo clicar neste botão, será criado um canal de texto para você conversar diretamente com o setor de Compras, caso nenhuma das opções anteriores atenda à sua necessidade.\n\nEstamos aqui para facilitar o seu atendimento e ajudar você a resolver suas demandas com agilidade! 🏆✨\n\n👇🏼 Clique no botão 'Atendimento Compras 🛒' para começar.",
            color: "#3b82f6", // Cor verde
            url: "https://discord.com/channels/1285697402409582736/1309574068395315240" // URL do canal
        });

        // Botão para abrir um novo chamado
        // let button = new ButtonBuilder()
        //     .setCustomId("newTicket")
        //     .setLabel("Abrir um novo Chamado +")
        //     .setStyle(ButtonStyle.Success);
        
        const button = new ButtonBuilder({ 
                customId: `compras`,
                label: "Atendimento Compras 🛒",
                style: ButtonStyle.Primary
            })
        

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(button);

        // Enviar o embed para um canal específico (use o ID real do canal)
        const channel = await interaction.client.channels.fetch("1309574068395315240") as TextChannel;
        if (channel) {
            const sentMessage = await channel.send({ embeds: [embed], components: [row] });

            console.log(sentMessage);
        }

        // Responder de forma invisível para o usuário que executou o comando
        interaction.reply({ ephemeral: true, content: "Embed fixado no canal com sucesso!" });
    }
});