import { Responder, ResponderType } from "#base";
import { ModalBuilder, TextInputBuilder, ActionRowBuilder, Routes, TextInputStyle, REST, MessageCollector, Message, ThreadChannel, } from "discord.js";
import { ThreadsAPI } from "../../../api/thread.js";
import { APIChannel } from "discord-api-types/v10";
import { PrismaClient } from "@prisma/client";

const RESTInstance = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
const threadsAPI = new ThreadsAPI(RESTInstance);
const cargoId = "1310664105610444820";
const channelThreadId = '1310942001423843349';
const activeCollectors: Map<string, { collector: MessageCollector; messages: { author: string; content: string; timestamp: string }[] }> = new Map();

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

            const threadTitle = `🚨🛒 SC - User: ${interaction.user.globalName} - ${numeroTicket}`;

            const thread = await RESTInstance.post(Routes.threads(channelThreadId), {
                body: {
                    name: threadTitle,
                    type: 12, // THREAD_PRIVATE (exemplo de thread privada)
                },
            }) as APIChannel;

            const threadId = thread.id; // Pegar o ID da thread recém-criada

            await threadsAPI.addMember(threadId, interaction.user.id);

            const threadChannel = (await interaction.client.channels.fetch(
                threadId
            )) as ThreadChannel;
            if (threadChannel) {
                await threadChannel.send(
                    `<@&${cargoId}> 
                    \n📌 Uma nova Solicitação foi aberta por **${interaction.user.globalName}**. 🛍️
                    \n📃 **Assunto:** ${assunto}.
                    \n📃 **Descrição:** ${descricao}`
                );
            }

            // Enviar chamado para o banco apos a seleção
            try {
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
            } catch (error) {
                console.error("Erro ao criar solicitacao no banco:", error);
            }

            if (threadChannel) {
                const collectedMessages: { author: string; content: string; timestamp: string }[] = [];;
                const collector = threadChannel.createMessageCollector({});
                activeCollectors.set(threadId, { collector: collector, messages: collectedMessages });
        
                collector.on("collect", (message: Message) => {
                  collectedMessages.push({
                    author: message.author.username,
                    content: message.cleanContent,
                    timestamp: message.createdTimestamp.toString(),
                  });
                  console.log(`📩 Mensagem coletada: ${message.author.tag}: ${message.content}`);
                  console.log(`📊 Total de mensagens armazenadas: ${collectedMessages.length}`);
                });
        
                collector.on("end", async () => {
                  console.log(`Coleta finalizada. Total de mensagens: ${collectedMessages.length}`);
        
                  // Salvar as mensagens no banco de dados
                  await prisma.solicitacao.update({
                    where: { ticket: numeroTicket },
                    data: { messagesRegister: collectedMessages }
                  });
                  console.log("📂 Mensagens salvas no banco de dados com sucesso!");
        
                  // activeCollectors.delete(threadId);
                });
              }
              await interaction.editReply({
                content:
                  "Sua solicitação foi registrada com sucesso e a thread foi criada.",
              });
            } catch (error) {
              console.error("Erro ao processar a seleção ou criar thread:", error);
              if (interaction.replied || interaction.deferred) {
                await interaction.editReply({
                  content: "Ocorreu um erro ao processar sua solicitação.",
                });
              } else {
                await interaction.reply({
                  content: "Ocorreu um erro ao processar sua solicitação.",
                  ephemeral: true,
                });
              }
            }
          },
        });
        