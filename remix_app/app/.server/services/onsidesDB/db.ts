import { init, doRawQuery, sequelize } from './dbInit';
import { QueryTypes } from 'sequelize';

export const getProducts = async () => {
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

export const getProductDetails = async (id: string) => {
    if (!sequelize) {
        await init();
    }
    const results = await doRawQuery(`
        SELECT 
            vrp.rxnorm_id as "RxCUI",
            vrp.rxnorm_name as "ProductName",
            pl.source as "Source",
            pl.source_product_name as "SourceProductName",
            pl.source_product_id as "SourceProductId",
            pl.source_label_url as "SourceLabelUrl"
        FROM
            vocab_rxnorm_product vrp,
            product_to_rxnorm pr,
            product_label pl
        WHERE
            vrp.rxnorm_id = pr.rxnorm_product_id
            AND pr.label_id = pl.label_id
            AND vrp.rxnorm_id = ?
        `, QueryTypes.SELECT, [id]);
    return results;
};

export const getProductIngredients = async (id: string) => {
    if (!sequelize) {
        await init();
    }
    
    try {
        // Try the ultra-fast materialized view first
        const results = await doRawQuery(`
            SELECT 
                ingredient_name as "IngredientName",
                ingredient_rxnorm_cui as "RxNormCUI",
                ingredient_term_type as "TermType"
            FROM web_product_ingredients_fast
            WHERE product_id = ?
            `, QueryTypes.SELECT, [id]);
        
        console.log("Fetched product ingredients (fast view):", results);
        return results;
    } catch (error) {
        console.warn("Fast view not available, falling back to JOIN query:", error);
        
        // Fallback to optimized JOIN query if materialized view doesn't exist
        const results = await doRawQuery(`
            SELECT 
                vri.rxnorm_name as "IngredientName",
                vri.rxnorm_id as "RxNormCUI",
                vri.rxnorm_term_type as "TermType"
            FROM vocab_rxnorm_ingredient_to_product vrip
            INNER JOIN vocab_rxnorm_ingredient vri ON vrip.ingredient_id = vri.rxnorm_id
            WHERE vrip.product_id = ?
            `, QueryTypes.SELECT, [id]);
        
        console.log("Fetched product ingredients (fallback):", results);
        return results;
    }
}

export const getProductAdverseEffects = async (id: string) => {
    if (!sequelize) {
        await init();
    }

    try {
        // Try the ultra-fast materialized view first
        const results = await doRawQuery(`
            SELECT DISTINCT
                label_section as section,
                meddra_id as id,
                meddra_name as name,
                meddra_term_type as termtype
            FROM web_product_adverse_effects_fast
            WHERE rxnorm_product_id = ?
            `, QueryTypes.SELECT, [id]);
        
        return results;
    } catch (error) {
        console.warn("Fast view not available, falling back to JOIN query:", error);
        
        // Fallback to optimized JOIN query if materialized view doesn't exist
        const results = await doRawQuery(`
            SELECT DISTINCT
                  label_section as section,
                  meddra_id as id,
                  meddra_name as name,
                  meddra_term_type as termtype
           FROM product_label
           INNER JOIN product_to_rxnorm USING (label_id)
           INNER JOIN product_adverse_effect ON label_id = product_label_id
           INNER JOIN vocab_meddra_adverse_effect ON effect_meddra_id = meddra_id
           WHERE rxnorm_product_id = ?
           `, QueryTypes.SELECT, [id]);
        
        return results;
    }
};

export const getIngredients = async () => {
    if (!sequelize) {
        await init();
    }
    const results = await doRawQuery(`
        SELECT 
            rxnorm_id as "RxCUI",
            rxnorm_name as "IngredientName"
        FROM
            vocab_rxnorm_ingredient
        `, QueryTypes.SELECT, []);
    return results;
}

export const getIngredient = async (id: string) => {
    if (!sequelize) {
        await init();
    }
    const results = await doRawQuery(`
        SELECT 
            rxnorm_id as "RxCUI",
            rxnorm_name as "IngredientName",
            rxnorm_term_type as "TermType"
        FROM
            vocab_rxnorm_ingredient
        WHERE
            rxnorm_id = ?
        `, QueryTypes.SELECT, [id]);
    return results;
}

export const getIngredientAdverseEffects = async (id: string) => {
    if (!sequelize) {
        await init();
    }
    
    try {
        // Try the ultra-fast materialized view first
        const results = await doRawQuery(`
            SELECT 
                distinct
                rxnorm_product_id,
                label_id,
                source,
                source_product_name,
                source_product_id,
                source_label_url,
                label_section,
                meddra_name,
                meddra_id
            FROM web_ingredient_adverse_effects_fast
            WHERE ingredient_rxnorm_id = ?
            `, QueryTypes.SELECT, [id]);
        
        return results;
    } catch (error) {
        console.warn("Fast view not available, falling back to JOIN query:", error);
        
        // Fallback to optimized JOIN query if materialized view doesn't exist
        const results = await doRawQuery(`
            SELECT 
                distinct
                ptr.rxnorm_product_id,
                pl.label_id,
                pl.source,
                pl.source_product_name,
                pl.source_product_id,
                pl.source_label_url,
                pae.label_section,
                vmae.meddra_name,
                vmae.meddra_id
            FROM vocab_rxnorm_ingredient vri
            INNER JOIN vocab_rxnorm_ingredient_to_product vritp ON vritp.ingredient_id = vri.rxnorm_id
            INNER JOIN product_to_rxnorm ptr ON vritp.product_id = ptr.rxnorm_product_id
            INNER JOIN product_label pl ON ptr.label_id = pl.label_id
            INNER JOIN product_adverse_effect pae ON pl.label_id = pae.product_label_id
            INNER JOIN vocab_meddra_adverse_effect vmae ON pae.effect_meddra_id = vmae.meddra_id
            WHERE vri.rxnorm_id = ?
            `, QueryTypes.SELECT, [id]);
        
        return results;
    }
}

export const getIngredientWithAdverseEffects = async (id: string) => {
    if (!sequelize) {
        await init();
    }
    
    try {
        // Try the ultra-fast materialized view first with ingredient details
        const [ingredientResult, adverseEffectsResult] = await Promise.all([
            doRawQuery(`
                SELECT 
                    rxnorm_id as "RxCUI",
                    rxnorm_name as "IngredientName",
                    rxnorm_term_type as "TermType"
                FROM vocab_rxnorm_ingredient
                WHERE rxnorm_id = ?
                `, QueryTypes.SELECT, [id]),
            doRawQuery(`
                SELECT 
                    distinct
                    rxnorm_product_id,
                    label_id,
                    source,
                    source_product_name,
                    source_product_id,
                    source_label_url,
                    label_section,
                    meddra_name,
                    meddra_id
                FROM web_ingredient_adverse_effects_fast
                WHERE ingredient_rxnorm_id = ?
                `, QueryTypes.SELECT, [id])
        ]);
        
        return {
            ingredient: ingredientResult,
            adverseEffects: adverseEffectsResult
        };
    } catch (error) {
        console.warn("Fast view not available, falling back to optimized queries:", error);
        
        // Fallback to optimized queries if materialized view doesn't exist
        const [ingredientResult, adverseEffectsResult] = await Promise.all([
            doRawQuery(`
                SELECT 
                    rxnorm_id as "RxCUI",
                    rxnorm_name as "IngredientName",
                    rxnorm_term_type as "TermType"
                FROM vocab_rxnorm_ingredient
                WHERE rxnorm_id = ?
                `, QueryTypes.SELECT, [id]),
            doRawQuery(`
                SELECT 
                    distinct
                    ptr.rxnorm_product_id,
                    pl.label_id,
                    pl.source,
                    pl.source_product_name,
                    pl.source_product_id,
                    pl.source_label_url,
                    pae.label_section,
                    vmae.meddra_name,
                    vmae.meddra_id
                FROM vocab_rxnorm_ingredient vri
                INNER JOIN vocab_rxnorm_ingredient_to_product vritp ON vritp.ingredient_id = vri.rxnorm_id
                INNER JOIN product_to_rxnorm ptr ON vritp.product_id = ptr.rxnorm_product_id
                INNER JOIN product_label pl ON ptr.label_id = pl.label_id
                INNER JOIN product_adverse_effect pae ON pl.label_id = pae.product_label_id
                INNER JOIN vocab_meddra_adverse_effect vmae ON pae.effect_meddra_id = vmae.meddra_id
                WHERE vri.rxnorm_id = ?
                `, QueryTypes.SELECT, [id])
        ]);
        
        return {
            ingredient: ingredientResult,
            adverseEffects: adverseEffectsResult
        };
    }
}

export const getIngredientLabels = async (id: string) => {
    if (!sequelize) {
        await init();
    }
    const results = await doRawQuery(`
        SELECT 
            pl.*
        FROM
            product_label pl,
            product_to_rxnorm ptr
        WHERE
            ptr.label_id = pl.label_id
            AND ptr.rxnorm_product_id = ?
        `, QueryTypes.SELECT, [id]);
    return results;
};

export const getAdverseEffects = async () => {
    if (!sequelize) {
        await init();
    }
    const results = await doRawQuery(`
        SELECT 
            meddra_id as "AdverseEffectId",
            meddra_name as "AdverseEffectName",
            meddra_term_type as "AdverseEffectTermType"
        FROM
            vocab_meddra_adverse_effect
        `, QueryTypes.SELECT, []);
    return results;
}

export const getAdverseEffectsIngredients = async (id: string) => {
    if (!sequelize) {
        await init();
    }
    
    try {
        // Try the ultra-fast materialized view first
        const results = await doRawQuery(`
            SELECT 
                distinct
                rxnorm_product_id as product_id,
                ingredient_id,
                source,
                ingredient_name as "ingredient_name",
                product_name as "product_name",
                label_section        
            FROM web_adverse_effect_ingredients_fast
            WHERE meddra_id = ?
            `, QueryTypes.SELECT, [id]);
        
        return results;
    } catch (error) {
        console.warn("Fast view not available, falling back to JOIN query:", error);
        
        // Fallback to optimized JOIN query if materialized view doesn't exist
        const results = await doRawQuery(`
            SELECT 
                distinct
                ptr.rxnorm_product_id as product_id,
                vritp.ingredient_id,
                pl.source,
                vri.rxnorm_name as "ingredient_name",
                vrp.rxnorm_name as "product_name",
                pae.label_section        
            FROM vocab_rxnorm_ingredient vri
            INNER JOIN vocab_rxnorm_ingredient_to_product vritp ON vritp.ingredient_id = vri.rxnorm_id
            INNER JOIN vocab_rxnorm_product vrp ON vritp.product_id = vrp.rxnorm_id
            INNER JOIN product_to_rxnorm ptr ON vritp.product_id = ptr.rxnorm_product_id
            INNER JOIN product_label pl ON ptr.label_id = pl.label_id
            INNER JOIN product_adverse_effect pae ON pl.label_id = pae.product_label_id
            INNER JOIN vocab_meddra_adverse_effect vmae ON pae.effect_meddra_id = vmae.meddra_id
            WHERE vmae.meddra_id = ?
            `, QueryTypes.SELECT, [id]);
        
        return results;
    }
}

export const getAdverseEffect = async (id: string) => {
    if (!sequelize) {
        await init();
    }
    const results = await doRawQuery(`
        SELECT 
            meddra_id as "AdverseEffectId",
            meddra_name as "AdverseEffectName",
            meddra_term_type as "AdverseEffectTermType"
        FROM
            vocab_meddra_adverse_effect
        WHERE
            meddra_id = ?
        `, QueryTypes.SELECT, [id]);
    return results;
}

export const getAllTerms = async () => {
    if (!sequelize) {
        await init();
    }
    const results = await doRawQuery(`
        	select meddra_id as term_id, meddra_name as term_name, 'adverseEffect' as term_type from vocab_meddra_adverse_effect vmae 
	            union all
	        select rxnorm_id  as term_id, rxnorm_name  as term_name, 'ingredient' as term_type from vocab_rxnorm_ingredient vri 
	            union all
	        select rxnorm_id  as term_id, rxnorm_name  as term_name, 'product' as term_type from vocab_rxnorm_product vrp 
        `, QueryTypes.SELECT, []);
    return results;
}

export const getStats = async () => {
    if (!sequelize) {
        await init();
    }
    const results = await doRawQuery(`
        SELECT 
            (SELECT COUNT(*) FROM vocab_rxnorm_product) AS product_count,
            (SELECT COUNT(*) FROM vocab_rxnorm_ingredient) AS ingredient_count,
            (SELECT COUNT(*) FROM vocab_meddra_adverse_effect) AS adverse_effect_count,
            (SELECT COUNT(*) FROM product_adverse_effect) AS product_adverse_effect_count
        LIMIT 1
        `, QueryTypes.SELECT, []);
    return results[0];
}