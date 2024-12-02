# Use a versão específica do Node.js
FROM docker.io/library/node:21.5

# Definir o diretório de trabalho
WORKDIR /bot

# Copiar o Oracle Instant Client
COPY instantclient-basic.zip /bot/instantclient-basic.zip

# Instalar dependências necessárias
RUN apt-get update && apt-get install -y libaio1 unzip curl && rm -rf /var/lib/apt/lists/*

# Configurar o Oracle Instant Client
RUN unzip /bot/instantclient-basic.zip && \
    rm /bot/instantclient-basic.zip && \
    mv instantclient_* instantclient && \
    ln -s /bot/instantclient/libclntsh.so.21.1 /usr/lib/libclntsh.so && \
    ln -s /bot/instantclient/libocci.so.21.1 /usr/lib/libocci.so && \
    echo /bot/instantclient > /etc/ld.so.conf.d/oracle-instantclient.conf && \
    ldconfig

# Configurar o path da biblioteca Oracle
ENV LD_LIBRARY_PATH=/bot/instantclient:$LD_LIBRARY_PATH

# Copiar arquivos necessários para a aplicação
COPY ./package*.json ./
COPY .env .env
COPY prisma ./prisma

# Instalar dependências do projeto
RUN npm install

# Gerar os artefatos do Prisma
RUN npx prisma generate --schema ./prisma/schema.prisma

# Copiar o restante dos arquivos do projeto
COPY . .

# Construir a aplicação
RUN npm run build

# Comando para rodar a aplicação
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
