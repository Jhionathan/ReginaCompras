import oracledb from "oracledb";


oracledb.initOracleClient({ libDir: 'C:\\instantclient\\instantclient_23_5' });
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
            `SELECT
                P.CODPROD,
                P.DESCRICAO,
                SUM(NVL(E.QTESTGER, 0) - NVL(E.QTRESERV, 0) - NVL(E.QTBLOQUEADA,  0) - NVL(E.QTPENDENTE, 0) - NVL(E.QTFRENTELOJA, 0)) AS QTDREAL,
            FROM
                PCEST E
            INNER JOIN PCPRODUT P ON
                P.CODPROD = E.CODPROD
            WHERE
                E.CODFILIAL = 1
                AND P.CODPROD = :productCode
                AND P.OBS2 <> 'FL'
            GROUP BY
            P.CODPROD,
            P.DESCRICAO,`,
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
        console.log('✔ Modal component prevChegada responder loaded!');
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