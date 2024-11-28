import oracledb from "oracledb";

// PARA WINDOWS
oracledb.initOracleClient({ libDir: 'C:\\instantclient\\instantclient_23_5' });

// PARA UBUNTU
// oracledb.initOracleClient({ libDir: '/bot/instantclient' });


export async function fetchProductStock(productCode: number) {
    let connection;
    try {
        console.log('Connecting to Oracle database...');
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_HOST
        });
        const result = await connection.execute(
            `SELECT P.CODPROD, P.DESCRICAO, SUM(E.QTESTGER - E.QTRESERV - E.QTBLOQUEADA - E.QTPENDENTE - E.QTFRENTELOJA) AS QTDREAL
            FROM PCEST E INNER JOIN PCPRODUT P ON P.CODPROD = E.CODPROD 
            WHERE E.CODFILIAL = 1 AND P.CODPROD = :productCode 
            GROUP BY P.CODPROD, P.DESCRICAO`,
            [productCode]
        );
        return result.rows as any[];
    } catch (err) {
        console.error('Erro ao consultar o banco de dados Oracle:', err);
        throw err;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}


export async function fetchProductPrev(productCode: number) {
    let connection;
    try {
        console.log('Connecting to Oracle database...');
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_HOST
        });

        const result = await connection.execute(
            `SELECT P.DTPREVENT, D.DESCRICAO, I.QTPEDIDA, D.CODPROD 
            FROM PCPEDIDO P
            INNER JOIN PCITEM I ON I.NUMPED = P.NUMPED
            INNER JOIN PCPRODUT D ON D.CODPROD = I.CODPROD
            WHERE I.QTENTREGUE = 0 AND I.CODPROD = :productCode`,
            [productCode]
        );
        return result.rows as any[];
    } catch (err) {
        console.error('Erro ao consultar o banco de dados Oracle:', err);
        throw err;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

export async function fetchProductData(productCode: number) {
    let connection;
    try {
        console.log('Connecting to Oracle database...');
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_HOST
        });

        const result = await connection.execute(
            `SELECT P.DTPREVENT, D.DESCRICAO, I.QTPEDIDA, D.CODPROD 
            FROM PCPEDIDO P
            INNER JOIN PCITEM I ON I.NUMPED = P.NUMPED
            INNER JOIN PCPRODUT D ON D.CODPROD = I.CODPROD
            WHERE I.QTENTREGUE = 0 AND I.CODPROD = :productCode`,
            [productCode]
        );
        return result.rows as any[];
    } catch (err) {
        console.error('Erro ao consultar o banco de dados Oracle:', err);
        throw err;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}