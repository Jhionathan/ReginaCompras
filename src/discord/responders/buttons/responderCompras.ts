import { Responder, ResponderType } from "#base";
import { createModalFields, createRow } from "@magicyan/discord";
import { ModalBuilder, TextInputBuilder, ActionRowBuilder, ButtonBuilder, TextChannel, Routes, ButtonStyle, EmbedBuilder, TextInputStyle, REST } from "discord.js";
import { fetchProductStock, fetchProductData } from "../../../functions/utils/common.js";
import { ThreadsAPI } from "../../../api/thread.js";
import { APIChannel } from "discord-api-types/v10";
import { PrismaClient } from "@prisma/client";
import  moment  from "moment";

const RESTInstance = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
const threadsAPI = new ThreadsAPI(RESTInstance);
const cargoId = "1310664105610444820";

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

// new Responder({
//     customId: "falar",
//     type: ResponderType.Button, cache: "cached",
//     async run(interaction) {
//         interaction.showModal({
//             title: "Previsão de Chegada 📦",
//             customId: "falarCompras",
//             components: createModalFields({
//                 product: {
//                     label: "Codigo do Produto",
//                     style: TextInputStyle.Short,
//                     required: true
//                 }
//             })
//         })
//     }
// });

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
            const assunto = interaction.fields.getTextInputValue("assunto");
            const descricao = interaction.fields.getTextInputValue("descricao");

                const threadTitle = `🚨🎫 Usuário: ${interaction.user.globalName}`;

                const channelThreads = "1298349477429645352";

                const thread = await RESTInstance.post(Routes.threads(channelThreads), {
                    body: {
                        name: threadTitle,
                        type: 11, // THREAD_PRIVATE (exemplo de thread privada)
                    }
                }) as APIChannel;

                const threadId = thread.id; // Pegar o ID da thread recém-criada

                await threadsAPI.addMember(threadId, interaction.user.id);

                const threadChannel = await interaction.client.channels.fetch(threadId) as TextChannel;
                if (threadChannel) {
                    await threadChannel.send(`<@&${cargoId}> \nUma nova Solicitação foi aberta por **${interaction.user.globalName}**. 🛍️\n**Assunto:** ${assunto}.\n**Descrição:** ${descricao}`);
                }

                // Enviar chamado para o banco apos a seleção
                const solicitacao = await prisma.solicitacao.create({
                    data: {
                        requester: interaction.user.globalName as string,
                        subtitle: assunto,
                        description: descricao,
                    }
                });
                console.log(solicitacao)

                const channel = await interaction.client.channels.fetch("1298349477429645352") as TextChannel;
                if (channel) {
                    await channel.send(`**Thread criada:** ${threadTitle}\n **Descricão:** ${descricao}\n **Data de criação:** ${new Date()}`);
                }
            
        } catch (error) {
            console.error("Erro ao processar a seleção ou criar thread:", error);
            await interaction.followUp({ content: "Ocorreu um erro ao processar o solicitacao.", ephemeral: true });
        }
    }
});