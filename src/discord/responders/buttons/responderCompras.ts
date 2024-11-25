import { Responder, ResponderType } from "#base";
import { createModalFields, createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, EmbedBuilder, TextInputStyle } from "discord.js";
import { fetchProductStock, fetchProductData } from "../../../functions/utils/common.js";
import  moment  from "moment";
import { z } from "zod";


const schema = z.object({
    productName: z.string().min(1, { message: "O nome do produto é obrigatório" }),
    quantity: z.string().min(1, { message: "A quantidade e local de entrega é obrigatória" }),
    nameClient: z.string().min(1, { message: "O nome do cliente é obrigatório" }),
    portUrgency: z.string().min(1, { message: "O porte do cliente e a urgência são obrigatórios" }),
    observations: z.string().min(1, { message: "A observação é obrigatória" }),
});

 

new Responder({
    customId: "compras",
    type: ResponderType.Button,
    run: (interaction) => {
        const buttonPrvisao = createRow(
            new ButtonBuilder()
                .setCustomId("previsao")
                .setLabel("Previsão de Chegada")
                .setStyle(ButtonStyle.Primary)
        )

        const buttonNovos = createRow(
            new ButtonBuilder()
                .setCustomId("novos")
                .setLabel("Novos Produtos")
                .setStyle(ButtonStyle.Primary)
        )

        const buttonFalar = createRow(
            new ButtonBuilder()
                .setCustomId("falar")
                .setLabel("Falar com o Compras")
                .setStyle(ButtonStyle.Primary)
        )

        interaction.reply({ ephemeral: true, components: [buttonPrvisao, buttonNovos, buttonFalar]});
    }
})


new Responder({
    customId: "previsao",
    type: ResponderType.Button, cache: "cached",
    async run(interaction) {
        interaction.showModal({
            title: "Previsão de Chegada",
            customId: "prevChegada",
            components: createModalFields({
                product: {
                    label: "Codigo do Produto",
                    style: TextInputStyle.Short,
                    required: true
                }
            })
        })
    }
})

new Responder({
    customId: "prevChegada",
    type: ResponderType.ModalComponent, cache: "cached",

    async run(interaction) {
        const productCode = interaction.fields.getTextInputValue("product").trim();
        if (!productCode) {
            console.error('Erro ao consultar o banco de dados Oracle: productCode is null or undefined');
            interaction.reply({ content: 'Erro ao consultar o banco de dados Oracle: productCode is null or undefined', ephemeral: true })
            return;
        }
        try {
            const rows = await fetchProductData(parseInt(productCode));
            const stock = await fetchProductStock (parseInt(productCode));
            const codProduto = stock[0][0];
            const descriptionProduc = stock[0][1];
            const qtdStock = stock[0][2]; 
            if (!rows || rows.length === 0 || !stock || stock.length === 0) {
                const embendFail = new EmbedBuilder()
                    .setColor('#ED4245')
                    .setTitle("Produtos R3 Suprimentos")
                    .setDescription(`Nenhuma previsão encontrada para o código informado "${productCode}"`)
                    .addFields({
                        name: 'Produto',
                        value: descriptionProduc,
                        inline: false
                    })
                    .addFields({
                        name: 'Código',
                        value: codProduto.toString(),
                        inline: false
                    })
                    .addFields({
                        name: 'Estoque Atual',
                        value: qtdStock.toString(),
                        inline: false
                    })
                    .setImage(`https://r3suprimentos.agilecdn.com.br/${codProduto}.jpg`)
                    .setTimestamp()
                    .setThumbnail('https://r3suprimentos.com/_next/image?url=%2Flogo-color.png&w=64&q=75')
                    .setFooter({ text: 'Data de consulta' });

                const channel = interaction.guild.channels.cache.get('1293630242472071280');
                interaction.reply({ embeds: [embendFail], content: `Entre em contato com o setor de compras ${channel}`, ephemeral: true })
                return;
            } else {
                const dataPrevisao = moment(rows[0][0]).format('DD/MM/YYYY');
                const description = rows[0][1];
                const qtPedido = rows[0][2].toString();
                const codProduto = rows[0][3].toString();

                const embend = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setThumbnail('https://r3suprimentos.com/_next/image?url=%2Flogo-color.png&w=64&q=75')
                    .setImage(`https://r3suprimentos.agilecdn.com.br/${codProduto}.jpg`)
                    .addFields({
                        name: 'O Produto',
                        value: description,
                        inline: false
                    })
                    .addFields({
                        name: 'Código',
                        value: productCode,
                        inline: false
                    })
                    .addFields({
                        name: 'Data de Previsão',
                        value: dataPrevisao,
                        inline: false
                    })
                    .addFields({
                        name: 'Quantidade Pedida',
                        value: qtPedido,
                        inline: false
                    })
                    .addFields({
                        name: 'Estoque Atual',
                        value: qtdStock.toString(),
                        inline: false
                    })
                    .setTimestamp()
                    .setFooter({ text: 'Data de consulta' });

                interaction.reply({ embeds: [embend], ephemeral: true })
            }
        } catch (err) {
            console.error('Erro ao consultar o banco de dados Oracle:', err);
        }
    }
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
    async run(interaction) {
        if (!interaction.isModalSubmit()){
            console.log('Erro: interaction is not a ModalSubmitInteraction');
            return;
        } 
        await interaction.deferReply({ ephemeral: true });
        if (!interaction.fields) {
            return interaction.reply({ content: 'Não foi possível obter os campos do formulário.', ephemeral: true });
        }

        const nameClient = interaction.fields.getTextInputValue("nameClient");
        const portUrgency = interaction.fields.getTextInputValue("portUrgency");
        const productName = interaction.fields.getTextInputValue("productName");
        const quantity = interaction.fields.getTextInputValue("quantity");
        const observations = interaction.fields.getTextInputValue("observations");

        if (!productName || !quantity || !nameClient || !portUrgency || !observations) {
            return interaction.editReply({ content: 'Preencha todos os campos do formulário.' });
        }
        const modalData = {
            nameClient,
            portUrgency,
            productName,
            quantity,
            observations,
        };

        const validation = schema.safeParse(modalData);

        if (!validation.success) {
            const errorMessages = validation.error.errors.map((err) => err.message).join("\n");
            return interaction.editReply({ content: `Erro de validação:\n${errorMessages}` });
        }
    }
})
