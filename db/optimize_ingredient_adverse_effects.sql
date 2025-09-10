-- Optimization script for getIngredientAdverseEffects query
-- This creates a denormalized view that pre-joins all the ingredient adverse effects data
-- Run this script in your database to achieve near-instantaneous query performance

-- Step 1: Create a materialized view (table) with pre-joined data
DROP TABLE IF EXISTS web_ingredient_adverse_effects_fast;

CREATE TABLE web_ingredient_adverse_effects_fast AS
SELECT DISTINCT
    vri.rxnorm_id as ingredient_rxnorm_id,
    vri.rxnorm_name as ingredient_name,
    vri.rxnorm_term_type as ingredient_term_type,
    ptr.rxnorm_product_id,
    pl.label_id,
    pl.source,
    pl.source_product_name,
    pl.source_product_id,
    pl.source_label_url,
    pae.label_section,
    vmae.meddra_id,
    vmae.meddra_name,
    vmae.meddra_term_type
FROM vocab_rxnorm_ingredient vri
INNER JOIN vocab_rxnorm_ingredient_to_product vritp ON vritp.ingredient_id = vri.rxnorm_id
INNER JOIN product_to_rxnorm ptr ON vritp.product_id = ptr.rxnorm_product_id
INNER JOIN product_label pl ON ptr.label_id = pl.label_id
INNER JOIN product_adverse_effect pae ON pl.label_id = pae.product_label_id
INNER JOIN vocab_meddra_adverse_effect vmae ON pae.effect_meddra_id = vmae.meddra_id;

-- Step 2: Create indexes for lightning-fast lookups
CREATE INDEX idx_web_ingredient_adverse_effects_fast_ingredient_id 
ON web_ingredient_adverse_effects_fast (ingredient_rxnorm_id);

CREATE INDEX idx_web_ingredient_adverse_effects_fast_compound 
ON web_ingredient_adverse_effects_fast (ingredient_rxnorm_id, label_section);

CREATE INDEX idx_web_ingredient_adverse_effects_fast_product_id 
ON web_ingredient_adverse_effects_fast (rxnorm_product_id);

CREATE INDEX idx_web_ingredient_adverse_effects_fast_meddra 
ON web_ingredient_adverse_effects_fast (meddra_id);

CREATE INDEX idx_web_ingredient_adverse_effects_fast_source 
ON web_ingredient_adverse_effects_fast (source);

-- Step 3: Add this to your ETL pipeline to keep the view updated
-- You should regenerate this table whenever the source data changes:
/*
-- Add to your ETL script:
DROP TABLE IF EXISTS web_ingredient_adverse_effects_fast;
CREATE TABLE web_ingredient_adverse_effects_fast AS
SELECT DISTINCT
    vri.rxnorm_id as ingredient_rxnorm_id,
    vri.rxnorm_name as ingredient_name,
    vri.rxnorm_term_type as ingredient_term_type,
    ptr.rxnorm_product_id,
    pl.label_id,
    pl.source,
    pl.source_product_name,
    pl.source_product_id,
    pl.source_label_url,
    pae.label_section,
    vmae.meddra_id,
    vmae.meddra_name,
    vmae.meddra_term_type
FROM vocab_rxnorm_ingredient vri
INNER JOIN vocab_rxnorm_ingredient_to_product vritp ON vritp.ingredient_id = vri.rxnorm_id
INNER JOIN product_to_rxnorm ptr ON vritp.product_id = ptr.rxnorm_product_id
INNER JOIN product_label pl ON ptr.label_id = pl.label_id
INNER JOIN product_adverse_effect pae ON pl.label_id = pae.product_label_id
INNER JOIN vocab_meddra_adverse_effect vmae ON pae.effect_meddra_id = vmae.meddra_id;

CREATE INDEX idx_web_ingredient_adverse_effects_fast_ingredient_id 
ON web_ingredient_adverse_effects_fast (ingredient_rxnorm_id);
*/

-- Performance test query (should be instantaneous)
EXPLAIN QUERY PLAN
SELECT 
    distinct
    rxnorm_product_id,
    label_id,
    source,
    source_product_name,
    source_product_id,
    source_label_url,
    label_section,
    meddra_name
FROM web_ingredient_adverse_effects_fast
WHERE ingredient_rxnorm_id = '1234';  -- Replace with actual ingredient ID

-- Show table statistics
SELECT 
    'web_ingredient_adverse_effects_fast' as table_name,
    COUNT(*) as total_rows,
    COUNT(DISTINCT ingredient_rxnorm_id) as unique_ingredients,
    COUNT(DISTINCT rxnorm_product_id) as unique_products,
    COUNT(DISTINCT meddra_id) as unique_adverse_effects,
    COUNT(DISTINCT label_section) as unique_sections,
    AVG(LENGTH(meddra_name)) as avg_adverse_effect_name_length
FROM web_ingredient_adverse_effects_fast;

-- Test different query patterns that might be used
SELECT 
    'Top 10 ingredients with most adverse effects' as analysis,
    ingredient_name,
    COUNT(DISTINCT meddra_id) as adverse_effect_count
FROM web_ingredient_adverse_effects_fast 
GROUP BY ingredient_rxnorm_id, ingredient_name
ORDER BY adverse_effect_count DESC
LIMIT 10;
