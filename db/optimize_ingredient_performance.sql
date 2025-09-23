-- Performance optimization indexes for ingredient adverse effects queries
-- These indexes should significantly improve query performance

-- Index on ingredient_rxnorm_id for the fast view lookup
CREATE INDEX IF NOT EXISTS idx_ingredient_adverse_effects_fast_ingredient_id 
ON web_ingredient_adverse_effects_fast(ingredient_rxnorm_id);

-- Composite indexes for the fallback JOIN queries
CREATE INDEX IF NOT EXISTS idx_vocab_rxnorm_ingredient_to_product_ingredient_id 
ON vocab_rxnorm_ingredient_to_product(ingredient_id);

CREATE INDEX IF NOT EXISTS idx_vocab_rxnorm_ingredient_to_product_product_id 
ON vocab_rxnorm_ingredient_to_product(product_id);

CREATE INDEX IF NOT EXISTS idx_product_to_rxnorm_rxnorm_product_id 
ON product_to_rxnorm(rxnorm_product_id);

CREATE INDEX IF NOT EXISTS idx_product_to_rxnorm_label_id 
ON product_to_rxnorm(label_id);

CREATE INDEX IF NOT EXISTS idx_product_label_label_id 
ON product_label(label_id);

CREATE INDEX IF NOT EXISTS idx_product_adverse_effect_product_label_id 
ON product_adverse_effect(product_label_id);

CREATE INDEX IF NOT EXISTS idx_product_adverse_effect_effect_meddra_id 
ON product_adverse_effect(effect_meddra_id);

CREATE INDEX IF NOT EXISTS idx_vocab_meddra_adverse_effect_meddra_id 
ON vocab_meddra_adverse_effect(meddra_id);

-- Index on rxnorm_id for ingredient lookup
CREATE INDEX IF NOT EXISTS idx_vocab_rxnorm_ingredient_rxnorm_id 
ON vocab_rxnorm_ingredient(rxnorm_id);

-- Additional composite indexes for better JOIN performance
CREATE INDEX IF NOT EXISTS idx_product_to_rxnorm_composite 
ON product_to_rxnorm(rxnorm_product_id, label_id);

CREATE INDEX IF NOT EXISTS idx_ingredient_to_product_composite 
ON vocab_rxnorm_ingredient_to_product(ingredient_id, product_id);

-- ANALYZE tables to update statistics for query optimizer
ANALYZE vocab_rxnorm_ingredient;
ANALYZE vocab_rxnorm_ingredient_to_product;
ANALYZE product_to_rxnorm;
ANALYZE product_label;
ANALYZE product_adverse_effect;
ANALYZE vocab_meddra_adverse_effect;

-- If the fast view exists, analyze it too
ANALYZE web_ingredient_adverse_effects_fast;
