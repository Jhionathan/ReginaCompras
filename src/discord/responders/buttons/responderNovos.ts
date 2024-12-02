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



// const schema = z.object({
    //     productName: z.string().min(1, { message: "O nome do produto é obrigatório" }),
    //     quantity: z.string().min(1, { message: "A quantidade e local de entrega é obrigatória" }),
    //     nameClient: z.string().min(1, { message: "O nome do cliente é obrigatório" }),
//     portUrgency: z.string().min(1, { message: "O porte do cliente e a urgência são obrigatórios" }),
//     observations: z.string().min(1, { message: "A observação é obrigatória" }),
// });



new Responder({
    customId: "novos",
    type: ResponderType.Button,
    cache: "cached",
    async run(interaction) {
        interaction.showModal({
            title: "Solicitar novos produtos",
            customId: "modalNewProd",
            components: createModalFields({
                nameClient: {
                    label: "👤 Nome do cliente / Solicitante",
                    placeholder: "Nome do cliente / Solicitante",
                    style: TextInputStyle.Short,
                    required: true,
                },
                portUrgency: {
                    label: "🚨 Porte e urgência",
                    placeholder: "Porte e urgência",
                    style: TextInputStyle.Short,
                    required: true,
                },
                productName: {
                    label: "🏷️ Nome do produto",
                    placeholder: "Nome do produto",
                    style: TextInputStyle.Short,
                    required: true,
                },
                quantity: {
                    label: "🚚 Quantidade e Local de entrega",
                    placeholder: "Quantidade e Local de entrega",
                    style: TextInputStyle.Short,
                    required: true,
                },
                observations: {
                    label: "📝 Observação",
                    placeholder: "Observação",
                    style: TextInputStyle.Paragraph,
                    required: true,
                },
            }),
        });
    },
});

const prisma = new PrismaClient();

new Responder({
    customId: "modalNewProd",
    type: ResponderType.ModalComponent,
    cache: "cached",
    async run(interaction: ModalSubmitInteraction<"cached">) {
        
        try {
            await interaction.deferReply({ ephemeral: true });

            const nameClientInput = interaction.fields.getTextInputValue("nameClient");
            const portUrgencyInput = interaction.fields.getTextInputValue("portUrgency");
            const productNameInput = interaction.fields.getTextInputValue("productName");
            const quantityInput = interaction.fields.getTextInputValue("quantity");
            const observationsInput = interaction.fields.getTextInputValue("observations");

            const numeroTicket = gerarNumeroTicket();

            const threndTitle = `🚨📦 NP - User: ${interaction.user.globalName} - ${numeroTicket}`;
            const channelThrend = '1311319138177650708';

            const thread = await RESTInstance.post(Routes.threads(channelThrend), {
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
                    \n👤**Cliente:** ${nameClientInput}
                    \n🚨**Porte e Urgência:** ${portUrgencyInput}
                    \n🚚**Quantidade e Local de entrega:** ${quantityInput}
                    \n📝**Observação:** ${observationsInput}`
                );
            }

            // Enviar chamado para o banco apos a seleção
            const SolicitacaoNovosProdutos = await prisma.novos_produtos.create({
                data: {
                    requester: interaction.user.globalName as string,
                    nameClient: nameClientInput,
                    portUrgency: portUrgencyInput,
                    nameProduct: productNameInput,
                    quantityAndDelivery: quantityInput,
                    observation: observationsInput,
                    typeproblem: "NovosProdutos",
                    ticket: numeroTicket
                },
            });
            console.log(SolicitacaoNovosProdutos);

            const channel = await interaction.client.channels.fetch("1311319138177650708") as TextChannel;
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