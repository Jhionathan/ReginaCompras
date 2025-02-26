import { Command } from "#base";
import {
    ApplicationCommandType,
    ThreadChannel,
    PermissionFlagsBits
} from "discord.js";
import { PrismaClient } from "@prisma/client";
import { toZonedTime } from "date-fns-tz";

const prisma = new PrismaClient();

new Command({
    name: "finalizaratendimento",
    description: "Envie isso para encerrar o atendimento 🛒",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
    async run(interaction) {
        try {
            //id do cargo
            const allowedRoleId = "1310664105610444820"; // Substitua pelo ID do cargo permitido

            // Verifica se o usuário tem o cargo permitido
            const member = interaction.member;
            if (!member.roles.cache.has(allowedRoleId)) {
                await interaction.reply({
                    content: "Você não tem permissão para usar este comando.",
                    ephemeral: true,
                });
                return;
            }

            // Envia uma resposta imediata ao usuário
            await interaction.reply({
                content:
                    "✅🛒 ***O assunto a ser tratado na solicitação foi concluída*** 🛒✅\n\n **Essa solicitação será encerrada. ❎**\nObrigado pela atenção.",
                ephemeral: false,
            });

            const channel = interaction.channel;
            const userFinishTicket = interaction.user.globalName;

            if (channel instanceof ThreadChannel) {
                const threadTitle = channel.name;
                const chamadoNumber = threadTitle.match(/\d+/)?.[0];
                const chamadoName = threadTitle.match(/\b(NP|SC)\b/)?.[0];

                
                if (chamadoNumber) {

                    const now = new Date();
                    const utcDate = toZonedTime(now, "America/Sao_Paulo");
    
                    if (chamadoName === "SC") {

                        try {
                            // Atualiza os dados do chamado no banco
                            const updatedChamado = await prisma.solicitacao.update({
                                where: {
                                    ticket: chamadoNumber,
                                },
                                data: {
                                    finishedAt: utcDate,
                                    finishedByUser: userFinishTicket,
                                },
                            });
    
                            if (!updatedChamado) {
                                console.log("Chamado não encontrado no banco de dados.");
                                return;
                            }
    
                            console.log(`Chamado ${chamadoNumber} encerrado com sucesso.`);
    
                            // Deleta a thread após 3 segundos
                            setTimeout(async () => {
                                try {
                                    await channel.delete();
                                    console.log(`Thread ${channel.id} deletada com sucesso.`);
                                } catch (error) {
                                    console.error("Erro ao deletar a thread:", error);
                                }
                            }, 3000);
                        } catch (error) {
                            console.error("Erro ao atualizar o banco de dados:", error);
                        }

                    } else if (chamadoName === "NP"){

                        try {
                            // Atualiza os dados do chamado no banco
                            const updatedChamado = await prisma.novos_produtos.update({
                                where: {
                                    ticket: chamadoNumber,
                                },
                                data: {
                                    finishedAt: utcDate,
                                    finishedByUser: userFinishTicket,
                                },
                            });
    
                            if (!updatedChamado) {
                                console.log("Chamado não encontrado no banco de dados.");
                                return;
                            }
    
                            console.log(`Chamado ${chamadoNumber} encerrado com sucesso.`);
    
                            // Deleta a thread após 3 segundos
                            setTimeout(async () => {
                                try {
                                    await channel.delete();
                                    console.log(`Thread ${channel.id} deletada com sucesso.`);
                                } catch (error) {
                                    console.error("Erro ao deletar a thread:", error);
                                }
                            }, 3000);
                        } catch (error) {
                            console.error("Erro ao atualizar o banco de dados:", error);
                        }
                    } else {

                        try {
                            // Atualiza os dados do chamado no banco
                            const updatedChamado = await prisma.reposicao_produtos.update({
                                where: {
                                    ticket: chamadoNumber,
                                },
                                data: {
                                    finishedAt: utcDate,
                                    finishedByUser: userFinishTicket,
                                },
                            });
    
                            if (!updatedChamado) {
                                console.log("Chamado não encontrado no banco de dados.");
                                return;
                            }
    
                            console.log(`Chamado ${chamadoNumber} encerrado com sucesso.`);
    
                            // Deleta a thread após 3 segundos
                            setTimeout(async () => {
                                try {
                                    await channel.delete();
                                    console.log(`Thread ${channel.id} deletada com sucesso.`);
                                } catch (error) {
                                    console.error("Erro ao deletar a thread:", error);
                                }
                            }, 3000);
                        } catch (error) {
                            console.error("Erro ao atualizar o banco de dados:", error);
                        }
                    }


                } else {
                    console.log("Número do chamado não encontrado no título da thread.");
                }
            } else {
                console.log("Este comando só pode ser usado dentro de uma thread.");
            }
        } catch (error) {
            console.error("Erro ao processar o encerramento do chamado:", error);
            if (!interaction.replied) {
                await interaction.reply({
                    content: "Ocorreu um erro ao processar o comando.",
                    ephemeral: true,
                });
            }
        }
    },
});
