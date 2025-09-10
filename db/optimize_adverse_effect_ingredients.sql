-- Optimization script for getAdverseEffectsIngredients query
-- This creates a denormalized view that pre-joins all the adverse effect to ingredients data
-- Run this script in your database to achieve near-instantaneous query performance

-- Step 1: Create a materialized view (table) with pre-joined data
DROP TABLE IF EXISTS web_adverse_effect_ingredients_fast;

CREATE TABLE web_adverse_effect_ingredients_fast AS
SELECT DISTINCT
    vmae.meddra_id,
    vmae.meddra_name,
    vmae.meddra_term_type,
    ptr.rxnorm_product_id,
    vritp.ingredient_id,
    vri.rxnorm_name as ingredient_name,
    vri.rxnorm_term_type as ingredient_term_type,
    vrp.rxnorm_name as product_name,
    vrp.rxnorm_term_type as product_term_type,
    pl.source,
    pl.source_product_name,
    pl.source_product_id,
    pl.source_label_url,
    pae.label_section
FROM vocab_rxnorm_ingredient vri
INNER JOIN vocab_rxnorm_ingredient_to_product vritp ON vritp.ingredient_id = vri.rxnorm_id
INNER JOIN vocab_rxnorm_product vrp ON vritp.product_id = vrp.rxnorm_id
INNER JOIN product_to_rxnorm ptr ON vritp.product_id = ptr.rxnorm_product_id
INNER JOIN product_label pl ON ptr.label_id = pl.label_id
INNER JOIN product_adverse_effect pae ON pl.label_id = pae.product_label_id
INNER JOIN vocab_meddra_adverse_effect vmae ON pae.effect_meddra_id = vmae.meddra_id;

-- Step 2: Create indexes for lightning-fast lookups
CREATE INDEX idx_web_adverse_effect_ingredients_fast_meddra_id 
ON web_adverse_effect_ingredients_fast (meddra_id);

CREATE INDEX idx_web_adverse_effect_ingredients_fast_compound 
ON web_adverse_effect_ingredients_fast (meddra_id, label_section);

CREATE INDEX idx_web_adverse_effect_ingredients_fast_ingredient_id 
ON web_adverse_effect_ingredients_fast (ingredient_id);

CREATE INDEX idx_web_adverse_effect_ingredients_fast_product_id 
ON web_adverse_effect_ingredients_fast (rxnorm_product_id);

CREATE INDEX idx_web_adverse_effect_ingredients_fast_source 
ON web_adverse_effect_ingredients_fast (source);

-- Step 3: Add this to your ETL pipeline to keep the view updated
-- You should regenerate this table whenever the source data changes:
/*
-- Add to your ETL script:
DROP TABLE IF EXISTS web_adverse_effect_ingredients_fast;
CREATE TABLE web_adverse_effect_ingredients_fast AS
SELECT DISTINCT
    vmae.meddra_id,
    vmae.meddra_name,
    vmae.meddra_term_type,
    ptr.rxnorm_product_id,
    vritp.ingredient_id,
    vri.rxnorm_name as ingredient_name,
    vri.rxnorm_term_type as ingredient_term_type,
    vrp.rxnorm_name as product_name,
    vrp.rxnorm_term_type as product_term_type,
    pl.source,
    pl.source_product_name,
    pl.source_product_id,
    pl.source_label_url,
    pae.label_section
FROM vocab_rxnorm_ingredient vri
INNER JOIN vocab_rxnorm_ingredient_to_product vritp ON vritp.ingredient_id = vri.rxnorm_id
INNER JOIN vocab_rxnorm_product vrp ON vritp.product_id = vrp.rxnorm_id
INNER JOIN product_to_rxnorm ptr ON vritp.product_id = ptr.rxnorm_product_id
INNER JOIN product_label pl ON ptr.label_id = pl.label_id
INNER JOIN product_adverse_effect pae ON pl.label_id = pae.product_label_id
INNER JOIN vocab_meddra_adverse_effect vmae ON pae.effect_meddra_id = vmae.meddra_id;

CREATE INDEX idx_web_adverse_effect_ingredients_fast_meddra_id 
ON web_adverse_effect_ingredients_fast (meddra_id);
*/

-- Performance test query (should be instantaneous)
EXPLAIN QUERY PLAN
SELECT 
    distinct
    rxnorm_product_id as product_id,
    ingredient_id,
    source,
    ingredient_name as "ingredient_name",
    product_name as "product_name",
    label_section        
FROM web_adverse_effect_ingredients_fast
WHERE meddra_id = '10000045';  -- Replace with actual adverse effect ID

-- Show table statistics
SELECT 
    'web_adverse_effect_ingredients_fast' as table_name,
    COUNT(*) as total_rows,
    COUNT(DISTINCT meddra_id) as unique_adverse_effects,
    COUNT(DISTINCT ingredient_id) as unique_ingredients,
    COUNT(DISTINCT rxnorm_product_id) as unique_products,
    COUNT(DISTINCT label_section) as unique_sections,
    AVG(LENGTH(ingredient_name)) as avg_ingredient_name_length
FROM web_adverse_effect_ingredients_fast;

-- Test different query patterns that might be used
SELECT 
    'Top 10 adverse effects with most associated ingredients' as analysis,
    meddra_name,
    COUNT(DISTINCT ingredient_id) as ingredient_count
FROM web_adverse_effect_ingredients_fast 
GROUP BY meddra_id, meddra_name
ORDER BY ingredient_count DESC
LIMIT 10;
