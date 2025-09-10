-- Combined optimization script for all complex queries
-- This creates multiple materialized views for maximum performance
-- Run this script in your database to optimize all slow queries

-- =============================================================================
-- 1. PRODUCT INGREDIENTS OPTIMIZATION
-- =============================================================================
DROP TABLE IF EXISTS web_product_ingredients_fast;

CREATE TABLE web_product_ingredients_fast AS
SELECT 
    vrip.product_id,
    vri.rxnorm_name as ingredient_name,
    vri.rxnorm_id as ingredient_rxnorm_cui,
    vri.rxnorm_term_type as ingredient_term_type
FROM vocab_rxnorm_ingredient_to_product vrip
INNER JOIN vocab_rxnorm_ingredient vri ON vrip.ingredient_id = vri.rxnorm_id;

CREATE INDEX idx_web_product_ingredients_fast_product_id 
ON web_product_ingredients_fast (product_id);

CREATE INDEX idx_web_product_ingredients_fast_compound 
ON web_product_ingredients_fast (product_id, ingredient_name);

-- =============================================================================
-- 2. PRODUCT ADVERSE EFFECTS OPTIMIZATION
-- =============================================================================
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

CREATE INDEX idx_web_product_adverse_effects_fast_compound 
ON web_product_adverse_effects_fast (rxnorm_product_id, label_section);

CREATE INDEX idx_web_product_adverse_effects_fast_meddra 
ON web_product_adverse_effects_fast (meddra_id);

-- =============================================================================
-- 3. INGREDIENT ADVERSE EFFECTS OPTIMIZATION
-- =============================================================================
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

CREATE INDEX idx_web_ingredient_adverse_effects_fast_compound 
ON web_ingredient_adverse_effects_fast (ingredient_rxnorm_id, label_section);

CREATE INDEX idx_web_ingredient_adverse_effects_fast_product_id 
ON web_ingredient_adverse_effects_fast (rxnorm_product_id);

-- =============================================================================
-- 4. ADVERSE EFFECT INGREDIENTS OPTIMIZATION
-- =============================================================================
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

CREATE INDEX idx_web_adverse_effect_ingredients_fast_compound 
ON web_adverse_effect_ingredients_fast (meddra_id, label_section);

CREATE INDEX idx_web_adverse_effect_ingredients_fast_ingredient_id 
ON web_adverse_effect_ingredients_fast (ingredient_id);

-- =============================================================================
-- 5. PERFORMANCE VERIFICATION
-- =============================================================================

-- Test product ingredients query
EXPLAIN QUERY PLAN
SELECT 
    ingredient_name as "IngredientName",
    ingredient_rxnorm_cui as "RxNormCUI", 
    ingredient_term_type as "TermType"
FROM web_product_ingredients_fast 
WHERE product_id = '1234';

-- Test product adverse effects query  
EXPLAIN QUERY PLAN
SELECT DISTINCT
    label_section as section,
    meddra_id as id,
    meddra_name as name,
    meddra_term_type as termtype
FROM web_product_adverse_effects_fast
WHERE rxnorm_product_id = '1234';

-- Test ingredient adverse effects query
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
WHERE ingredient_rxnorm_id = '1234';

-- Test adverse effect ingredients query
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
WHERE meddra_id = '10000045';

-- =============================================================================
-- 6. STATISTICS AND MONITORING
-- =============================================================================

SELECT 
    'Complete Optimization Summary' as report_type,
    '' as table_name,
    '' as total_rows,
    '' as unique_keys,
    '' as performance_notes
UNION ALL
SELECT 
    'Table Statistics' as report_type,
    'web_product_ingredients_fast' as table_name,
    CAST(COUNT(*) as TEXT) as total_rows,
    CAST(COUNT(DISTINCT product_id) as TEXT) as unique_keys,
    'Product → Ingredients (2-table JOIN)' as performance_notes
FROM web_product_ingredients_fast
UNION ALL
SELECT 
    'Table Statistics' as report_type,
    'web_product_adverse_effects_fast' as table_name,
    CAST(COUNT(*) as TEXT) as total_rows,
    CAST(COUNT(DISTINCT rxnorm_product_id) as TEXT) as unique_keys,
    'Product → Adverse Effects (4-table JOIN)' as performance_notes
FROM web_product_adverse_effects_fast
UNION ALL
SELECT 
    'Table Statistics' as report_type,
    'web_ingredient_adverse_effects_fast' as table_name,
    CAST(COUNT(*) as TEXT) as total_rows,
    CAST(COUNT(DISTINCT ingredient_rxnorm_id) as TEXT) as unique_keys,
    'Ingredient → Adverse Effects (6-table JOIN)' as performance_notes
FROM web_ingredient_adverse_effects_fast
UNION ALL
SELECT 
    'Table Statistics' as report_type,
    'web_adverse_effect_ingredients_fast' as table_name,
    CAST(COUNT(*) as TEXT) as total_rows,
    CAST(COUNT(DISTINCT meddra_id) as TEXT) as unique_keys,
    'Adverse Effect → Ingredients (7-table JOIN)' as performance_notes
FROM web_adverse_effect_ingredients_fast;

-- =============================================================================
-- 7. ETL INTEGRATION TEMPLATE
-- =============================================================================

-- Add this section to your ETL pipeline:
/*
-- Complete optimization tables regeneration
DROP TABLE IF EXISTS web_product_ingredients_fast;
CREATE TABLE web_product_ingredients_fast AS
SELECT 
    vrip.product_id,
    vri.rxnorm_name as ingredient_name,
    vri.rxnorm_id as ingredient_rxnorm_cui,
    vri.rxnorm_term_type as ingredient_term_type
FROM vocab_rxnorm_ingredient_to_product vrip
INNER JOIN vocab_rxnorm_ingredient vri ON vrip.ingredient_id = vri.rxnorm_id;

CREATE INDEX idx_web_product_ingredients_fast_product_id 
ON web_product_ingredients_fast (product_id);

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
