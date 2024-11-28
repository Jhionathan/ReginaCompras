-- CreateTable
CREATE TABLE "solicitacao" (
    "id" SERIAL NOT NULL,
    "requester" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ticket" TEXT NOT NULL,
    "typeproblem" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "finishedByUser" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "novos_produtos" (
    "id" SERIAL NOT NULL,
    "requester" TEXT NOT NULL,
    "ticket" TEXT NOT NULL,
    "typeproblem" TEXT NOT NULL,
    "nameClient" TEXT NOT NULL,
    "portUrgency" TEXT,
    "nameProduct" TEXT NOT NULL,
    "quantityAndDelivery" TEXT NOT NULL,
    "observation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "finishedByUser" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "novos_produtos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "solicitacao_ticket_key" ON "solicitacao"("ticket");

-- CreateIndex
CREATE UNIQUE INDEX "novos_produtos_ticket_key" ON "novos_produtos"("ticket");
