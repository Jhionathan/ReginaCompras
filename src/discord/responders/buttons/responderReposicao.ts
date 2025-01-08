import { Responder, ResponderType } from "#base";
import { createModalFields } from "@magicyan/discord";
import {  TextChannel, Routes, TextInputStyle, REST, ModalSubmitInteraction } from "discord.js";
// import { z } from "zod";
import { ThreadsAPI } from "../../../api/thread.js";''
import { APIChannel } from "discord-api-types/v10";
import { PrismaClient } from "@prisma/client";
import { gerarNumeroTicket } from "./responderTalkBuyers.js";



const RESTInstance = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
const threadsAPI = new ThreadsAPI(RESTInstance);
const cargoId = "1293641175932080188";
const channelThreadId = '1326259010265026620';

new Responder({
    customId: "novos",
    type: ResponderType.Button,
    cache: "cached",
    async run(interaction) {
        interaction.showModal({
            title: "Solicitar Reposição de Produtos",
            customId: "modalReplaceProd",
            components: createModalFields({
                nameClient: {
                    label: "👤 Nome do cliente / Solicitante",
                    placeholder: "Digite o nome do cliente / Solicitante",
                    style: TextInputStyle.Short,
                    required: true,
                },
                productName: {
                    label: "🏷️ Nome do produto",
                    placeholder: "Digite o nome do produto",
                    style: TextInputStyle.Short,
                    required: true,
                },
                codProd: {
                    label: "🔢 Código do Produto",
                    placeholder: "3200",
                    style: TextInputStyle.Short,
                    required: true,
                },
                quantity: {
                    label: "🚚 Demanda",
                    placeholder: "Demanda",
                    style: TextInputStyle.Short,
                    required: true,
                },
                observations: {
                    label: "📝 Observação",
                    placeholder: "Digite a observação",
                    style: TextInputStyle.Paragraph,
                    required: true,
                },
            }),
        });
    },
});

const prisma = new PrismaClient();

new Responder({
    customId: "modalReplaceProd",
    type: ResponderType.ModalComponent,
    cache: "cached",
    async run(interaction: ModalSubmitInteraction<"cached">) {
        
        try {
            await interaction.deferReply({ ephemeral: true });

            const nameClientInput = interaction.fields.getTextInputValue("nameClient");
            const productNameInput = interaction.fields.getTextInputValue("productName");
            const codProdInput = interaction.fields.getTextInputValue("codProd");
            const quantityInput = interaction.fields.getTextInputValue("quantity");
            const observationsInput = interaction.fields.getTextInputValue("observations");

            const numeroTicket = gerarNumeroTicket();

            const threndTitle = `🚨📦 NP - User: ${interaction.user.globalName} - ${numeroTicket}`;

            const thread = await RESTInstance.post(Routes.threads(channelThreadId), {
                body: {
                    name: threndTitle,
                    type: 11,
                },
            }) as APIChannel;

            const threadId = thread.id;

            await threadsAPI.addMember(threadId, interaction.user.id);

            const threadChannel = await interaction.client.channels.fetch(threadId) as TextChannel;
            if (threadChannel) {
                await threadChannel.send(
                    `<@&${cargoId}> 
                    \n📌Uma nova Solicitação para novos produtos foi feita por **${interaction.user.globalName}**.
                    \n\n🏷️**Produto:** ${productNameInput}.
                    \n🔢**Código do Produto:** ${codProdInput}
                    \n👤**Cliente:** ${nameClientInput}
                    \n🚚**Quantidade e Local de entrega:** ${quantityInput}
                    \n📝**Observação:** ${observationsInput}`
                );
            }

            // Enviar chamado para o banco apos a seleção
            const SolicitacaoNovosProdutos = await prisma.reposicao_produtos.create({
                data: {
                    requester: interaction.user.globalName as string,
                    nameClient: nameClientInput,
                    codProd: codProdInput,
                    nameProduct: productNameInput,
                    quantityAndDelivery: quantityInput,
                    observation: observationsInput,
                    typeproblem: "NovosProdutos",
                    ticket: numeroTicket
                },
            });
            console.log(SolicitacaoNovosProdutos);

            const channel = await interaction.client.channels.fetch(`${channelThreadId}`) as TextChannel;
            if (channel) {
                await channel.send(
                    `**Thread criada:** ${threndTitle}\n **Produto:** ${productNameInput}\n **Data de Solicitação:** ${new Date()}`
                );
            }
            await interaction.editReply({
                content: "Sua solicitação foi registrada com sucesso e a thread foi criada.",
            })           

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