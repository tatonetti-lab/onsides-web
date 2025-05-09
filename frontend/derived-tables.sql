CREATE TEMPORARY TABLE labels_per_ingredient AS
SELECT
    ingredient_id,
    'ALL' AS source,
    label_id
FROM
    product_label
    INNER JOIN product_to_rxnorm USING (label_id)
    INNER JOIN vocab_rxnorm_ingredient_to_product ON rxnorm_product_id = product_id
UNION
SELECT
    ingredient_id,
    source,
    label_id
FROM
    product_label
    INNER JOIN product_to_rxnorm USING (label_id)
    INNER JOIN vocab_rxnorm_ingredient_to_product ON rxnorm_product_id = product_id;

CREATE TEMPORARY TABLE n_labels_per_ingredient AS
SELECT
    ingredient_id,
    source,
    COUNT(DISTINCT label_id) AS n_labels_total
FROM
    labels_per_ingredient
GROUP BY
    ingredient_id,
    source;

-------------------------------------------------------------------------------
-------------------------------------------------------------------------------
-- Grouping by source
-------------------------------------------------------------------------------
-------------------------------------------------------------------------------
CREATE TEMPORARY TABLE n_labels_adverse_per_ingredient AS
SELECT
    source,
    ingredient_id,
    effect_meddra_id,
    COUNT(DISTINCT label_id) AS n_labels_adverse
FROM
    labels_per_ingredient
    INNER JOIN product_adverse_effect ON label_id = product_label_id
GROUP BY
    source,
    ingredient_id,
    effect_meddra_id;

CREATE TABLE web_ingredient_meddra_summary_source AS
SELECT
    source,
    ingredient_id,
    effect_meddra_id,
    ROUND(n_labels_adverse * 100.0 / n_labels_total, 2) AS frac_labels
FROM
    n_labels_adverse_per_ingredient
    INNER JOIN n_labels_per_ingredient USING (source, ingredient_id);

-------------------------------------------------------------------------------
-------------------------------------------------------------------------------
-- Grouping by section (USA only)
-------------------------------------------------------------------------------
-------------------------------------------------------------------------------
CREATE TEMPORARY TABLE n_labels_adverse_per_ingredient_section AS
SELECT
    ingredient_id,
    label_section,
    effect_meddra_id,
    COUNT(DISTINCT label_id) AS n_labels_adverse
FROM
    labels_per_ingredient
    INNER JOIN product_adverse_effect ON label_id = product_label_id
WHERE
    source = 'US'
GROUP BY
    label_section,
    ingredient_id,
    effect_meddra_id;

CREATE TABLE web_ingredient_meddra_summary_section AS
SELECT
    label_section,
    ingredient_id,
    effect_meddra_id,
    ROUND(n_labels_adverse * 100.0 / n_labels_total, 2) AS frac_labels
FROM
    n_labels_adverse_per_ingredient_section
    INNER JOIN n_labels_per_ingredient USING (ingredient_id)
WHERE
    source = 'US';

-------------------------------------------------------------------------------
-------------------------------------------------------------------------------
-- Combined
-------------------------------------------------------------------------------
-------------------------------------------------------------------------------
CREATE TABLE web_ingredient_meddra_summary AS WITH combined_table AS (
    SELECT
        source,
        'ALL' AS label_section,
        ingredient_id,
        effect_meddra_id,
        frac_labels
    FROM
        web_ingredient_meddra_summary_source
    UNION
    SELECT
        'US' AS source,
        label_section,
        ingredient_id,
        effect_meddra_id,
        frac_labels
    FROM
        web_ingredient_meddra_summary_section
)
SELECT
    source,
    label_section,
    ingredient_id,
    meddra_id,
    meddra_name,
    frac_labels
FROM
    combined_table
    INNER JOIN vocab_meddra_adverse_effect ON meddra_id = effect_meddra_id;

DROP TABLE web_ingredient_meddra_summary_source;

DROP TABLE web_ingredient_meddra_summary_section;

CREATE INDEX idx_lookup ON web_ingredient_meddra_summary (
    source,
    label_section,
    ingredient_id,
    meddra_name
);

-------------------------------------------------------------------------------
-------------------------------------------------------------------------------
-- Develop the query
-------------------------------------------------------------------------------
-------------------------------------------------------------------------------
-- This gets the summary metrics for each adverse effect
-- (e.g. what fraction of products that contain naproxen may cause "headache")
SELECT
    meddra_id,
    meddra_name,
    frac_labels
FROM
    web_ingredient_meddra_summary
WHERE
    ingredient_id = 7515
    AND source = 'UK'
    AND label_section = 'ALL'
ORDER BY
    meddra_name
LIMIT
    50 OFFSET 150;

-- This is the specific set of products that cause each of the above adverse events
WITH relevant_meddra AS (
    SELECT
        meddra_id
    FROM
        web_ingredient_meddra_summary
    WHERE
        ingredient_id = 7515
        AND source = 'UK'
        AND label_section = 'ALL'
    ORDER BY
        meddra_name
    LIMIT
        50 OFFSET 150
)
SELECT
    rxnorm_product_id,
    source,
    source_product_name,
    source_label_url,
    meddra_id
FROM
    vocab_rxnorm_ingredient_to_product
    INNER JOIN product_to_rxnorm ON product_id = rxnorm_product_id
    INNER JOIN product_label USING (label_id)
    INNER JOIN product_adverse_effect ON label_id = product_label_id
    INNER JOIN relevant_meddra ON effect_meddra_id = meddra_id
WHERE
    ingredient_id = 7515
LIMIT
    5;

-------------------------------------------------------------------------------
-------------------------------------------------------------------------------
-- Get all for search
-------------------------------------------------------------------------------
-------------------------------------------------------------------------------
-- Ingredients
SELECT
    rxnorm_id,
    rxnorm_name,
    rxnorm_term_type
FROM
    vocab_rxnorm_ingredient;

-- Products
SELECT
    rxnorm_id,
    rxnorm_name,
    rxnorm_term_type
FROM
    vocab_rxnorm_product;

-- Adverse effects
SELECT
    meddra_id,
    meddra_name,
    meddra_term_type
FROM
    vocab_meddra_adverse_effect;

-- Find ingredients for a given adverse effect
SELECT
    DISTINCT rxnorm_id,
    rxnorm_name
FROM
    product_adverse_effect
    INNER JOIN product_label pl ON product_label_id = label_id
    INNER JOIN product_to_rxnorm USING (label_id)
    INNER JOIN vocab_rxnorm_ingredient_to_product ON rxnorm_product_id = product_id
    INNER JOIN vocab_rxnorm_ingredient ON ingredient_id = rxnorm_id
WHERE
    source IN ('US', 'UK', 'EU', 'JP')
    AND label_section IN ('NA', 'AR', 'BW', 'WP')
    AND effect_meddra_id = 10000081
ORDER BY
    rxnorm_id
LIMIT
    5;

------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
-- List drugs for a given adverse effect
-- With some cached derived tables
CREATE TABLE web_label_to_products AS
SELECT
    DISTINCT label_id,
    rxnorm_product_id AS drug_rxnorm_id,
    rxnorm_name AS drug_rxnorm_name
FROM
    product_label
    INNER JOIN product_to_rxnorm USING (label_id)
    INNER JOIN vocab_rxnorm_product ON rxnorm_product_id = rxnorm_id;

CREATE INDEX web_label_to_products_label_id ON web_label_to_products (label_id);

CREATE TABLE web_label_to_ingredients AS
SELECT
    DISTINCT label_id,
    ingredient_id AS drug_rxnorm_id,
    rxnorm_name AS drug_rxnorm_name
FROM
    product_label
    INNER JOIN product_to_rxnorm USING (label_id)
    INNER JOIN vocab_rxnorm_ingredient_to_product ON rxnorm_product_id = product_id
    INNER JOIN vocab_rxnorm_ingredient ON ingredient_id = rxnorm_id;

CREATE INDEX web_label_to_ingredients_label_id ON web_label_to_ingredients (label_id);

CREATE INDEX product_adverse_effect_label_id ON product_adverse_effect (product_label_id);

CREATE INDEX product_adverse_effect_meddra_id ON product_adverse_effect (effect_meddra_id);

CREATE INDEX vocab_rxnorm_ingredient_rxnorm_name ON vocab_rxnorm_ingredient (rxnorm_name);

CREATE INDEX vocab_rxnorm_product_rxnorm_name ON vocab_rxnorm_product (rxnorm_name);

SELECT
    label_id,
    drug_rxnorm_id,
    drug_rxnorm_name
FROM
    product_label
    INNER JOIN web_label_to_products USING (label_id)
    INNER JOIN product_adverse_effect ON label_id = product_label_id
    INNER JOIN vocab_meddra_adverse_effect ON effect_meddra_id = meddra_id
WHERE
    effect_meddra_id = 10000045
LIMIT
    50 OFFSET 100;

SELECT
    label_id,
    drug_rxnorm_id,
    drug_rxnorm_name
FROM
    product_label
    INNER JOIN web_label_to_products USING (label_id)
    INNER JOIN product_adverse_effect ON label_id = product_label_id
    INNER JOIN vocab_meddra_adverse_effect ON effect_meddra_id = meddra_id
WHERE
    effect_meddra_id = 10000045
LIMIT
    50 OFFSET 0;

SELECT
    label_id,
    drug_rxnorm_id AS rxcui,
    drug_rxnorm_name AS name
FROM
    product_label
    INNER JOIN web_label_to_ingredients USING (label_id)
    INNER JOIN product_adverse_effect ON label_id = product_label_id
    INNER JOIN vocab_meddra_adverse_effect ON effect_meddra_id = meddra_id
WHERE
    effect_meddra_id = 10000045
ORDER BY
    name
LIMIT
    10 OFFSET 0;

SELECT
    product_label.*
FROM
    product_label
    INNER JOIN product_to_rxnorm USING (label_id)
WHERE
    rxnorm_product_id = 1536142;

SELECT
    DISTINCT label_section,
    meddra_id,
    meddra_name,
    meddra_term_type
FROM
    product_label
    INNER JOIN product_to_rxnorm USING (label_id)
    INNER JOIN product_adverse_effect ON label_id = product_label_id
    INNER JOIN vocab_meddra_adverse_effect ON effect_meddra_id = meddra_id
WHERE
    rxnorm_product_id = 1536142;

SELECT
    DISTINCT rxnorm_id AS id,
    rxnorm_name AS name,
    rxnorm_term_type AS termtype
FROM
    product_label
    INNER JOIN product_to_rxnorm USING (label_id)
    INNER JOIN vocab_rxnorm_ingredient_to_product ON rxnorm_product_id = product_id
    INNER JOIN vocab_rxnorm_ingredient ON ingredient_id = rxnorm_id
WHERE
    rxnorm_product_id = 1536142;

SELECT
    rxnorm_id AS id,
    rxnorm_name AS name
FROM
    vocab_rxnorm_product
WHERE
    rxnorm_name LIKE '%%'
    AND rxnorm_id LIKE '%%'
ORDER BY
    rxnorm_id DESC
LIMIT
    10 OFFSET 0;

-------------------------------------------------------------------------------
-------------------------------------------------------------------------------
-------------------------------------------------------------------------------
-- On average, how many ingredients does each product have?
WITH n_ingredients_per_label AS (
    SELECT
        label_id,
        count(DISTINCT ingredient_id) AS n_ingredients
    FROM
        product_label
        INNER JOIN product_to_rxnorm USING (label_id)
        INNER JOIN vocab_rxnorm_ingredient_to_product ON rxnorm_product_id = product_id
    GROUP BY
        label_id
)
SELECT
    avg(n_ingredients)
FROM
    n_ingredients_per_label;

-- Find products with more than 5 ingredients
WITH selected_labels AS (
    SELECT
        label_id,
        count(DISTINCT ingredient_id) AS n_ingredients
    FROM
        product_label
        INNER JOIN product_to_rxnorm USING (label_id)
        INNER JOIN vocab_rxnorm_ingredient_to_product ON rxnorm_product_id = product_id
    GROUP BY
        label_id
    HAVING
        n_ingredients > 5
)
SELECT
    label_id,
    source,
    source_product_name,
    n_ingredients
FROM
    product_label
    INNER JOIN selected_labels USING (label_id);
