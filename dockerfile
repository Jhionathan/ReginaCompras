FROM docker.io/library/node:21.5
 
WORKDIR /bot

COPY instantclient-basic.zip /bot/instantclient-basic.zip

RUN apt-get update && apt-get install -y libaio1 unzip curl && rm -rf /var/lib/apt/lists/*

RUN unzip /bot/instantclient-basic.zip && \
    rm /bot/instantclient-basic.zip && \
    mv instantclient_* instantclient && \
    ln -s /bot/instantclient/libclntsh.so.21.1 /usr/lib/libclntsh.so && \
    ln -s /bot/instantclient/libocci.so.21.1 /usr/lib/libocci.so && \
    echo /bot/instantclient > /etc/ld.so.conf.d/oracle-instantclient.conf && \
    ldconfig

ENV LD_LIBRARY_PATH=/bot/instantclient:$LD_LIBRARY_PATH
 
COPY ./package*.json .
RUN npm install
 
COPY . .

COPY .env .env

RUN npx prisma generate
 
RUN npm run build
 
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]