import { Responder, ResponderType } from "#base";
import { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextChannel, Routes, TextInputStyle, REST } from "discord.js";
import { ThreadsAPI } from "../../../api/thread.js";
import { APIChannel } from "discord-api-types/v10";
import { PrismaClient } from "@prisma/client";

const RESTInstance = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
const threadsAPI = new ThreadsAPI(RESTInstance);
const cargoId = "1293641175932080188";

export function gerarNumeroTicket(): string {
    const timestamp = Date.now(); 
    const ticketNumber = `${timestamp}`;
    return ticketNumber;
}

new Responder({
    customId: "falar",
    type: ResponderType.Button,
    async run(interaction) {
        try {            
            const modal = new ModalBuilder()
                .setCustomId('solicitacaoModal') 
                .setTitle('Nova Solicitação 🛍️');

            const assuntoInput = new TextInputBuilder()
                .setCustomId('assunto') 
                .setLabel('Assunto da Solicitação')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const descricaoInput = new TextInputBuilder()
                .setCustomId('descricao')
                .setLabel('Dê uma descrição da Solicitação')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(assuntoInput),
                new ActionRowBuilder<TextInputBuilder>().addComponents(descricaoInput)
            );

            await interaction.showModal(modal);
        } catch (error) {
            console.error("Erro ao exibir o modal:", error);
            await interaction.reply({ content: "Ocorreu um erro ao abrir o modal.", ephemeral: true });
        }
    }
});

const prisma = new PrismaClient();

new Responder({
    customId: "solicitacaoModal",
    type: ResponderType.Modal,
    async run(interaction) {
        try {
            // Deferir a interação imediatamente para evitar timeout
            await interaction.deferReply({ ephemeral: true });

            const assunto = interaction.fields.getTextInputValue("assunto");
            const descricao = interaction.fields.getTextInputValue("descricao");

            const numeroTicket = gerarNumeroTicket();

            const threadTitle = `🚨🛍️ SC - User: ${interaction.user.globalName} - ${numeroTicket}`;
            const channelThreads = "1311319571420020777";

            const thread = await RESTInstance.post(Routes.threads(channelThreads), {
                body: {
                    name: threadTitle,
                    type: 11, // THREAD_PRIVATE (exemplo de thread privada)
                },
            }) as APIChannel;

            const threadId = thread.id; // Pegar o ID da thread recém-criada

            await threadsAPI.addMember(threadId, interaction.user.id);

            const threadChannel = await interaction.client.channels.fetch(threadId) as TextChannel;
            if (threadChannel) {
                await threadChannel.send(
                    `<@&${cargoId}> 
                    \n📌 Uma nova Solicitação foi aberta por **${interaction.user.globalName}**. 🛍️
                    \n📃 **Assunto:** ${assunto}.
                    \n📃 **Descrição:** ${descricao}`
                );
            }

            // Enviar chamado para o banco apos a seleção
            const solicitacao = await prisma.solicitacao.create({
                data: {
                    requester: interaction.user.globalName as string,
                    subtitle: assunto,
                    description: descricao,
                    typeproblem: "FalarCompras",
                    ticket: numeroTicket
                },
            });
            console.log(solicitacao);

            const channel = await interaction.client.channels.fetch("1311319571420020777") as TextChannel;
            if (channel) {
                await channel.send(
                    `**Thread criada:** ${threadTitle}\n **Descrição:** ${descricao}\n **Data de criação:** ${new Date()}`
                );
            }

            // Finalizar a interação com uma resposta ao usuário
            await interaction.editReply({
                content: "Sua solicitação foi registrada com sucesso e a thread foi criada.",
            });
        } catch (error) {
            console.error("Erro ao processar a seleção ou criar thread:", error);
            if (interaction.replied || interaction.deferred) {
                // Atualizar a interação caso já tenha sido deferida
                await interaction.editReply({
                    content: "Ocorreu um erro ao processar sua solicitação.",
                });
            } else {
                // Responder caso ainda não tenha sido deferida
                await interaction.reply({
                    content: "Ocorreu um erro ao processar sua solicitação.",
                    ephemeral: true,
                });
            }
        }
    },
});
