import { Responder, ResponderType } from "#base";
import { createModalFields } from "@magicyan/discord";
import { ModalSubmitInteraction, TextInputStyle } from "discord.js";
import { z } from "zod";



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
