-- Optimization script for getProductAdverseEffects query
-- This creates a denormalized view that pre-joins all the adverse effects data
-- Run this script in your database to achieve near-instantaneous query performance

-- Step 1: Create a materialized view (table) with pre-joined data
DROP TABLE IF EXISTS web_product_adverse_effects_fast;

CREATE TABLE web_product_adverse_effects_fast AS
SELECT DISTINCT
    ptr.rxnorm_product_id,
    pae.label_section,
    vmae.meddra_id,
    vmae.meddra_name,
    vmae.meddra_term_type,
    pl.source,
    pl.source_product_name,
    pl.source_product_id,
    pl.source_label_url
FROM product_label pl
INNER JOIN product_to_rxnorm ptr USING (label_id)
INNER JOIN product_adverse_effect pae ON pl.label_id = pae.product_label_id
INNER JOIN vocab_meddra_adverse_effect vmae ON pae.effect_meddra_id = vmae.meddra_id;

-- Step 2: Create indexes for lightning-fast lookups
CREATE INDEX idx_web_product_adverse_effects_fast_product_id 
ON web_product_adverse_effects_fast (rxnorm_product_id);

CREATE INDEX idx_web_product_adverse_effects_fast_compound 
ON web_product_adverse_effects_fast (rxnorm_product_id, label_section);

CREATE INDEX idx_web_product_adverse_effects_fast_meddra 
ON web_product_adverse_effects_fast (meddra_id);

CREATE INDEX idx_web_product_adverse_effects_fast_section 
ON web_product_adverse_effects_fast (label_section);

-- Step 3: Add this to your ETL pipeline to keep the view updated
-- You should regenerate this table whenever the source data changes:
/*
-- Add to your ETL script:
DROP TABLE IF EXISTS web_product_adverse_effects_fast;
CREATE TABLE web_product_adverse_effects_fast AS
SELECT DISTINCT
    ptr.rxnorm_product_id,
    pae.label_section,
    vmae.meddra_id,
    vmae.meddra_name,
    vmae.meddra_term_type,
    pl.source,
    pl.source_product_name,
    pl.source_product_id,
    pl.source_label_url
FROM product_label pl
INNER JOIN product_to_rxnorm ptr USING (label_id)
INNER JOIN product_adverse_effect pae ON pl.label_id = pae.product_label_id
INNER JOIN vocab_meddra_adverse_effect vmae ON pae.effect_meddra_id = vmae.meddra_id;

CREATE INDEX idx_web_product_adverse_effects_fast_product_id 
ON web_product_adverse_effects_fast (rxnorm_product_id);
*/

-- Performance test query (should be instantaneous)
EXPLAIN QUERY PLAN
SELECT DISTINCT
    label_section as section,
    meddra_id as id,
    meddra_name as name,
    meddra_term_type as termtype
FROM web_product_adverse_effects_fast
WHERE rxnorm_product_id = '1234';  -- Replace with actual product ID

-- Show table statistics
SELECT 
    'web_product_adverse_effects_fast' as table_name,
    COUNT(*) as total_rows,
    COUNT(DISTINCT rxnorm_product_id) as unique_products,
    COUNT(DISTINCT meddra_id) as unique_adverse_effects,
    COUNT(DISTINCT label_section) as unique_sections,
    AVG(LENGTH(meddra_name)) as avg_adverse_effect_name_length
FROM web_product_adverse_effects_fast;

-- Test different query patterns that might be used
SELECT 
    'Products with adverse effects in BOXED WARNINGS' as metric,
    COUNT(DISTINCT rxnorm_product_id) as count
FROM web_product_adverse_effects_fast 
WHERE label_section = 'BW'
UNION ALL
SELECT 
    'Products with adverse effects in ADVERSE REACTIONS' as metric,
    COUNT(DISTINCT rxnorm_product_id) as count
FROM web_product_adverse_effects_fast 
WHERE label_section = 'AR'
UNION ALL
SELECT 
    'Most common adverse effect' as metric,
    COUNT(*) as count
FROM web_product_adverse_effects_fast 
GROUP BY meddra_name 
ORDER BY count DESC 
LIMIT 1;
