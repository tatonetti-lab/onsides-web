import { init, doRawQuery, sequelize } from './dbInit';
import { QueryTypes } from 'sequelize';

export const getProducts= async () => {
    if (!sequelize) {
        await init();
    }
    const results = await doRawQuery(`
        SELECT 
            rxnorm_id as "RxCUI",
            rxnorm_name as "ProductName"
        FROM
            vocab_rxnorm_product
        `, QueryTypes.SELECT, []);
    return results;
}
