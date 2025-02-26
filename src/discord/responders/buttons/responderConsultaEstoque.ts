import { Responder, ResponderType } from "#base";
import { createModalFields } from "@magicyan/discord";
import { EmbedBuilder, TextInputStyle } from "discord.js";
import { fetchEstoque } from "../../../functions/utils/common.js";


new Responder({
    customId: "consultaEstoque",
    type: ResponderType.Button, cache: "cached",
    async run(interaction) {
        interaction.showModal({
            title: "Consultar estoque 📦",
            customId: "consultaEstoqueModal",
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
    customId: "consultaEstoqueModal",
    type: ResponderType.ModalComponent, cache: "cached",


    async run(interaction) {
        const productCode = interaction.fields.getTextInputValue("product").trim();
        if (!productCode) {
            console.error('Erro ao consultar o banco de dados Oracle: productCode is null or undefined');
            interaction.reply({ content: 'Erro ao consultar o banco de dados Oracle: productCode is null or undefined', ephemeral: true })
            return;
        }
        try {
            const stock = await fetchEstoque (parseInt(productCode));
            const codProduto = stock[0][0];
            const descriptionProduc = stock[0][1];
            const qtdStock = stock[0][2];
            if (!stock || qtdStock === 0) {
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
                        name: 'Estoque Frente de Loja',
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

                const embend = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle("Produtos R3 Suprimentos")
                    .setThumbnail('https://r3suprimentos.com/_next/image?url=%2Flogo-color.png&w=64&q=75')
                    .setImage(`https://r3suprimentos.agilecdn.com.br/${codProduto}.jpg`)
                    .addFields({
                        name: 'Nome do Produto',
                        value: descriptionProduc.toString(),
                        inline: false
                    })
                    .addFields({
                        name: 'Código',
                        value: productCode,
                        inline: false
                    })
                    .addFields({
                        name: 'Estoque',
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
