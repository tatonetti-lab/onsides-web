-- Optimization script for getProductIngredients query
-- This creates a denormalized view that pre-joins the ingredient data
-- Run this script in your database to achieve near-instantaneous query performance

-- Step 1: Create a materialized view (table) with pre-joined data
DROP TABLE IF EXISTS web_product_ingredients_fast;

CREATE TABLE web_product_ingredients_fast AS
SELECT 
    vrip.product_id,
    vri.rxnorm_name as ingredient_name,
    vri.rxnorm_id as ingredient_rxnorm_cui,
    vri.rxnorm_term_type as ingredient_term_type
FROM vocab_rxnorm_ingredient_to_product vrip
INNER JOIN vocab_rxnorm_ingredient vri ON vrip.ingredient_id = vri.rxnorm_id;

-- Step 2: Create indexes for lightning-fast lookups
CREATE INDEX idx_web_product_ingredients_fast_product_id 
ON web_product_ingredients_fast (product_id);

CREATE INDEX idx_web_product_ingredients_fast_compound 
ON web_product_ingredients_fast (product_id, ingredient_name);

CREATE INDEX idx_web_product_ingredients_fast_ingredient_id 
ON web_product_ingredients_fast (ingredient_rxnorm_cui);

-- Step 3: Add this to your ETL pipeline to keep the view updated
-- You should regenerate this table whenever the source data changes:
/*
-- Add to your ETL script:
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
*/

-- Performance test query (should be instantaneous)
EXPLAIN QUERY PLAN
SELECT 
    ingredient_name as "IngredientName",
    ingredient_rxnorm_cui as "RxNormCUI", 
    ingredient_term_type as "TermType"
FROM web_product_ingredients_fast 
WHERE product_id = '1234';  -- Replace with actual product ID

-- Show table statistics
SELECT 
    'web_product_ingredients_fast' as table_name,
    COUNT(*) as total_rows,
    COUNT(DISTINCT product_id) as unique_products,
    COUNT(DISTINCT ingredient_rxnorm_cui) as unique_ingredients,
    AVG(LENGTH(ingredient_name)) as avg_ingredient_name_length
FROM web_product_ingredients_fast;
