-- Drop all tables that might already exist
DROP TABLE IF EXISTS ingredientpublic;
DROP TABLE IF EXISTS adversereactionspublic;
DROP TABLE IF EXISTS n_products_per_ingredient;
DROP TABLE IF EXISTS labels_per_ingredient_adverse;
DROP TABLE IF EXISTS labels_per_ingredient_boxed;
DROP TABLE IF EXISTS labels_per_ingredient_warnings;
DROP TABLE IF EXISTS ingredient_to_adverse_percent_labels;
DROP TABLE IF EXISTS ingredient_to_boxed_percent_labels;
DROP TABLE IF EXISTS ingredient_to_warnings_percent_labels;
DROP TABLE IF EXISTS ingredients_per_adverse_event;
DROP TABLE IF EXISTS distinct_products_per_ingredient;
DROP TABLE IF EXISTS summary_stats;
DROP TABLE IF EXISTS ingredient_to_percent_labels;


-- Derived tables
CREATE TABLE ingredientpublic AS
SELECT DISTINCT ingredient_rx_cui, ingredient_omop_concept_id, ingredient_name
FROM ingredients;

CREATE INDEX ingredientpublic_rx_cui_idx ON ingredientpublic (ingredient_rx_cui);

CREATE TABLE adversereactionspublic AS
SELECT DISTINCT meddra_id, meddra_name
FROM adversereactions;

CREATE INDEX adversereactionspublic_meddra_id_idx ON adversereactionspublic (meddra_id);


---------------
CREATE TABLE n_products_per_ingredient AS
SELECT ingredient_rx_cui, COUNT(DISTINCT rx_cui) AS n_total_product_cuis
FROM ingredients
         INNER JOIN rxnormmappings USING (set_id)
GROUP BY ingredient_rx_cui;


CREATE TABLE labels_per_ingredient_adverse AS
SELECT ingredient_rx_cui,
       pt_meddra_id,
       pt_meddra_term,
       GROUP_CONCAT(DISTINCT rx_cui) AS product_rxcuis,
       COUNT(DISTINCT rx_cui)        AS n_product_rxcuis_with_adverse
FROM ingredients
         INNER JOIN adversereactionsactivelabels USING (set_id)
         INNER JOIN (SELECT * FROM rxnormmappings WHERE rx_tty = 'PSN') AS psns
                    USING (set_id, spl_version)
GROUP BY ingredient_rx_cui, pt_meddra_id, pt_meddra_term;


CREATE TABLE labels_per_ingredient_boxed AS
SELECT ingredient_rx_cui,
       pt_meddra_id,
       pt_meddra_term,
       GROUP_CONCAT(DISTINCT rx_cui) AS product_rxcuis,
       COUNT(DISTINCT rx_cui)        AS n_product_rxcuis_with_adverse
FROM ingredients
         INNER JOIN boxedwarningsactivelabels USING (set_id)
         INNER JOIN (SELECT * FROM rxnormmappings WHERE rx_tty = 'PSN') AS psns
                    USING (set_id, spl_version)
GROUP BY ingredient_rx_cui, pt_meddra_id, pt_meddra_term;

CREATE TABLE labels_per_ingredient_warnings AS
SELECT ingredient_rx_cui,
       pt_meddra_id,
       pt_meddra_term,
       GROUP_CONCAT(DISTINCT rx_cui) AS product_rxcuis,
       COUNT(DISTINCT rx_cui)        AS n_product_rxcuis_with_adverse
FROM ingredients
         INNER JOIN warningsandprecautionsactivelabels USING (set_id)
         INNER JOIN (SELECT * FROM rxnormmappings WHERE rx_tty = 'PSN') AS psns
                    USING (set_id, spl_version)
GROUP BY ingredient_rx_cui, pt_meddra_id, pt_meddra_term;


CREATE TABLE ingredient_to_adverse_percent_labels AS
SELECT ingredient_rx_cui,
       pt_meddra_id,
       pt_meddra_term,
       product_rxcuis,
       CAST(n_product_rxcuis_with_adverse AS REAL) / n_total_product_cuis AS percent
FROM n_products_per_ingredient
         INNER JOIN labels_per_ingredient_adverse USING (ingredient_rx_cui);

CREATE TABLE ingredient_to_boxed_percent_labels AS
SELECT ingredient_rx_cui,
       pt_meddra_id,
       pt_meddra_term,
       product_rxcuis,
       CAST(n_product_rxcuis_with_adverse AS REAL) / n_total_product_cuis AS percent
FROM n_products_per_ingredient
         INNER JOIN labels_per_ingredient_boxed USING (ingredient_rx_cui);

CREATE TABLE ingredient_to_warnings_percent_labels AS
SELECT ingredient_rx_cui,
       pt_meddra_id,
       pt_meddra_term,
       product_rxcuis,
       CAST(n_product_rxcuis_with_adverse AS REAL) / n_total_product_cuis AS percent
FROM n_products_per_ingredient
         INNER JOIN labels_per_ingredient_warnings USING (ingredient_rx_cui);


CREATE TABLE ingredient_to_percent_labels AS
SELECT 'adverse' AS category, *
FROM ingredient_to_adverse_percent_labels
UNION
SELECT 'boxed' AS category, *
FROM ingredient_to_boxed_percent_labels
UNION
SELECT 'warnings' AS category, *
FROM ingredient_to_warnings_percent_labels;

CREATE INDEX ingredient_to_percent_labels_category_query ON ingredient_to_percent_labels (category, ingredient_rx_cui);



CREATE TABLE ingredients_per_adverse_event AS
SELECT DISTINCT pt_meddra_id, 'adverse' AS category, ingredient_rx_cui, ingredient_name
FROM adversereactionsactivelabels
         INNER JOIN ingredients USING (set_id)
UNION
SELECT DISTINCT pt_meddra_id, 'boxed' AS category, ingredient_rx_cui, ingredient_name
FROM boxedwarningsactivelabels
         INNER JOIN ingredients USING (set_id)
UNION
SELECT DISTINCT pt_meddra_id, 'warnings' AS category, ingredient_rx_cui, ingredient_name
FROM warningsandprecautionsactivelabels
         INNER JOIN ingredients USING (set_id);

CREATE INDEX ingredients_per_adverse_event_pt_meddra_category_idx ON ingredients_per_adverse_event (pt_meddra_id, category);



CREATE TABLE distinct_products_per_ingredient AS
SELECT ingredient_rx_cui,
       rx_cui,
       spl_version,
       set_id,
       GROUP_CONCAT(DISTINCT upload_date) AS upload_dates,
       GROUP_CONCAT(DISTINCT rx_string)   AS rx_strings
FROM ingredients
         INNER JOIN dmsplzipfilesmetadata USING (set_id)
         INNER JOIN rxnormmappings USING (set_id, spl_version)
GROUP BY ingredient_rx_cui, rx_cui, spl_version, set_id;

CREATE INDEX distinct_products_per_ingredient_ingredient_rx_cui_idx ON distinct_products_per_ingredient (ingredient_rx_cui);


CREATE TABLE summary_stats AS
SELECT (SELECT COUNT(DISTINCT ingredient_omop_concept_id) AS num FROM ingredientpublic)      AS total_drugs,
       (SELECT COUNT(DISTINCT meddra_id) AS num FROM adversereactionspublic) AS total_adverse,
       (SELECT COUNT(*) AS num FROM adversereactionsactivelabels)                        AS total_pairs;


-- Clean up
DROP TABLE IF EXISTS n_products_per_ingredient;

DROP TABLE IF EXISTS labels_per_ingredient_adverse;
DROP TABLE IF EXISTS labels_per_ingredient_boxed;
DROP TABLE IF EXISTS labels_per_ingredient_warnings;

DROP TABLE IF EXISTS ingredient_to_adverse_percent_labels;
DROP TABLE IF EXISTS ingredient_to_boxed_percent_labels;
DROP TABLE IF EXISTS ingredient_to_warnings_percent_labels;

DROP TABLE IF EXISTS adversereactionsactivelabels;
DROP TABLE IF EXISTS adversereactionsalllabels;
DROP TABLE IF EXISTS boxedwarnings;
DROP TABLE IF EXISTS boxedwarningsactivelabels;
DROP TABLE IF EXISTS boxedwarningsalllabels;
DROP TABLE IF EXISTS dmsplzipfilesmetadata;
DROP TABLE IF EXISTS rxcuitsetidmap;
DROP TABLE IF EXISTS rxnormmappings;
DROP TABLE IF EXISTS rxnormproducttoingredient;
DROP TABLE IF EXISTS warningsandprecautions;
DROP TABLE IF EXISTS warningsandprecautionsactivelabels;
DROP TABLE IF EXISTS warningsandprecautionsalllabels;

VACUUM;
