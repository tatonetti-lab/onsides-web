import { Sequelize, Options, QueryTypes } from 'sequelize';

export let sequelize: Sequelize;

export function sequelizeInit() {
    try {
        const dbPath = './onsides.db';
        const options: Options = {
            dialect: 'sqlite',
            storage: dbPath,
            logging: false, // eslint-disable-line no-console
            define: {
                underscored: true,
                version: true,
            },
        };
        sequelize = new Sequelize(options);
    } catch (error) {
        console.error('Failed to initialize sequelize', error);
    }
}

export const connect = async () => {
    sequelizeInit();
    await sequelize.authenticate();
};

export const connectWithRetry = async (retryAttempts = 1) => {
    for (let i = 0; i < retryAttempts; i++) {
        try {
            await connect();
            break;
        } catch (err) {
            console.log(`Connection failed, retrying... Attempt ${i + 1}`);
        }
    }
};

export async function init() {
    connectWithRetry(100);
}

export const doRawQuery = async (query: string, queryType = QueryTypes.SELECT, values: unknown[] | unknown[]) => {
    try {
        return sequelize.query(query, { replacements: values, type: queryType, logging: false, plain: false, raw: true });
    } catch (err) {
        console.error('error:', err);
        throw new Error(`Error in RawSQL: ${err}`);
    }
};