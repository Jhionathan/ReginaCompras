import { Responder, ResponderType } from "#base";
import { createModalFields } from "@magicyan/discord";
import {  TextChannel, Routes, TextInputStyle, REST, ModalSubmitInteraction } from "discord.js";
import { z } from "zod";
import { ThreadsAPI } from "../../../api/thread.js";''
import { APIChannel } from "discord-api-types/v10";


const RESTInstance = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
const threadsAPI = new ThreadsAPI(RESTInstance);
const cargoId = "1310664105610444820";



const schema = z.object({
    productName: z.string().min(1, { message: "O nome do produto é obrigatório" }),
    quantity: z.string().min(1, { message: "A quantidade e local de entrega é obrigatória" }),
    nameClient: z.string().min(1, { message: "O nome do cliente é obrigatório" }),
    portUrgency: z.string().min(1, { message: "O porte do cliente e a urgência são obrigatórios" }),
    observations: z.string().min(1, { message: "A observação é obrigatória" }),
});



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
                    label: "Nome do cliente / Solicitante",
                    placeholder: "Nome do cliente / Solicitante",
                    style: TextInputStyle.Short,
                    required: true,
                },
                portUrgency: {
                    label: "Porte e urgência",
                    placeholder: "Porte e urgência",
                    style: TextInputStyle.Short,
                    required: true,
                },
                productName: {
                    label: "Nome do produto",
                    placeholder: "Nome do produto",
                    style: TextInputStyle.Short,
                    required: true,
                },
                quantity: {
                    label: "Quantidade e Local de entrega",
                    placeholder: "Quantidade e Local de entrega",
                    style: TextInputStyle.Short,
                    required: true,
                },
                observations: {
                    label: "Observação",
                    placeholder: "Observação",
                    style: TextInputStyle.Paragraph,
                    required: true,
                },
            }),
        });
    },
});


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

            const threndTitle = `Solicitar novos produtos - ${interaction.user.globalName}`;
            const channelThrend = '1296073765859360832';

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
                    `<@&${cargoId}> \nUma nova Solicitação para novos produtos foi feita por **${interaction.user.globalName}**.
                     \n**Produto:** ${productNameInput}.
                     \n**Cliente:** ${nameClientInput}
                     \n**Porte e Urgência:** ${portUrgencyInput}
                     \n**Quantidade e Local de entrega:** ${quantityInput}
                     \n**Observação:** ${observationsInput}`
                );
            }


            const channel = await interaction.client.channels.fetch("1298349477429645352") as TextChannel;
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



        const nameClientInput = interaction.fields.getTextInputValue("nameClient");
        const portUrgencyInput = interaction.fields.getTextInputValue("portUrgency");
        const productNameInput = interaction.fields.getTextInputValue("productName");
        const quantityInput = interaction.fields.getTextInputValue("quantity");
        const observationsInput = interaction.fields.getTextInputValue("observations");

        const modalData = {
            nameClient: nameClientInput,
            portUrgency: portUrgencyInput,
            productName: productNameInput,
            quantity: quantityInput,
            observations: observationsInput,
        };

        const validation = schema.safeParse(modalData);

        if (!validation.success) {
            const errorMessages = validation.error.errors.map((err) => err.message).join("\n");
            return interaction.editReply({ content: `Erro de validação:\n${errorMessages}` });
        }

        await interaction.deferReply({ ephemeral: true });
        await interaction.editReply({ content: "Formulário enviado com sucesso!" });
        return;
    }
})
