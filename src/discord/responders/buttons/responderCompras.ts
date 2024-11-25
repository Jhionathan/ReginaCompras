import { Responder, ResponderType } from "#base";
import { createModalFields, createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, EmbedBuilder, TextInputStyle } from "discord.js";
import { fetchProductStock, fetchProductData } from "../../../functions/utils/common.js";
import moment from "moment";

new Responder({
    customId: "compras",
    type: ResponderType.Button,
    run: (interaction) => {
        const embend = new EmbedBuilder()
            .setColor(0x0099FF)
            .setThumbnail('https://r3suprimentos.com/_next/image?url=%2Flogo-color.png&w=64&q=75')
            .setFields(
                { name: '**Compras** 🛒', value: '\nEscolha alguma das opções abaixo: ⬇️' },
            )
            .setTimestamp()
            .setFooter({ text: 'Data de consulta' });
            
                    
        const buttonPrevisao = createRow(
            new ButtonBuilder()
                .setCustomId("previsao")
                .setLabel("📦 ──▸Previsão de Chegada◂── 📦")
                .setStyle(ButtonStyle.Primary)
        )
                
        const buttonNovos = createRow(
            new ButtonBuilder()
                .setCustomId("novos")
                .setLabel("🏷️ ────▸Novos Produtos◂──── 🏷️")
                .setStyle(ButtonStyle.Primary)
        )

        const buttonFalar = createRow(
            new ButtonBuilder()
                .setCustomId("falar")
                .setLabel("🛍️ ──▸Falar com o Compras◂── 🛍️")
                .setStyle(ButtonStyle.Primary)
        )

        interaction.reply({ embeds: [embend], ephemeral: true, components: [buttonPrevisao, buttonNovos, buttonFalar]});
    }
})


new Responder({
    customId: "previsao",
    type: ResponderType.Button, cache: "cached",
    async run(interaction) {
        interaction.showModal({
            title: "Previsão de Chegada 📦",
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
