ATTACH 'loaded.db' AS sqlite_db (TYPE SQLITE);

DROP TABLE IF EXISTS sqlite_db.ingredients;
DROP TABLE IF EXISTS sqlite_db.rxnormmappings;
DROP TABLE IF EXISTS sqlite_db.adversereactionsactivelabels;
DROP TABLE IF EXISTS sqlite_db.boxedwarningsactivelabels;
DROP TABLE IF EXISTS sqlite_db.warningsandprecautionsactivelabels;
DROP TABLE IF EXISTS sqlite_db.dmsplzipfilesmetadata;
DROP TABLE IF EXISTS sqlite_db.adversereactions;

-- Create ingredients table
CREATE TABLE sqlite_db.ingredients AS
FROM read_csv("ingredients.csv.gz");

-- Create rxnormmappings table
CREATE TABLE sqlite_db.rxnormmappings AS
SELECT
    SETID AS set_id,
    SPL_VERSION AS spl_version,
    RXCUI AS rx_cui,
    RXSTRING AS rx_string,
    RXTTY AS rx_tty
FROM read_csv("rxnorm_mappings.csv.gz");

-- Create adversereactionsactivelabels table
CREATE TABLE sqlite_db.adversereactionsactivelabels AS
FROM read_csv("adverse_reactions_active_labels.csv.gz");

-- Create boxedwarningsactivelabels table
CREATE TABLE sqlite_db.boxedwarningsactivelabels AS
FROM read_csv("boxed_warnings_active_labels.csv.gz");

-- Create warningsandprecautionsactivelabels table
CREATE TABLE sqlite_db.warningsandprecautionsactivelabels AS
FROM read_csv("warnings_and_precautions_active_labels.csv.gz");

-- Create dmsplzipfilesmetadata table
CREATE TABLE sqlite_db.dmsplzipfilesmetadata AS
SELECT
    SETID AS set_id,
    ZIP_FILE_NAME AS zip_file_name,
    UPLOAD_DATE AS upload_date,
    SPL_VERSION AS spl_version,
    TITLE AS title
FROM read_csv("dm_spl_zip_files_meta_data.csv.gz");

-- Create adversereactions table
CREATE TABLE sqlite_db.adversereactions AS
SELECT
    pt_meddra_id AS meddra_id,
    pt_meddra_term AS meddra_name
FROM read_csv("adverse_reactions.csv.gz");


CREATE TABLE sqlite_db.vocab_rxnorm_ingredient AS
SELECT 
    rxnorm_id AS rxnorm_id,
    rxnorm_name AS rxnorm_name,
    rxnorm_term_type AS rxnorm_term_type
FROM read_csv("vocab_rxnorm_ingredient.csv.gz");

CREATE TABLE sqlite_db.vocab_rxnorm_product AS
SELECT 
    rxnorm_id AS rxnorm_id,
    rxnorm_name AS rxnorm_name,
    rxnorm_term_type AS rxnorm_term_type
FROM read_csv("vocab_rxnorm_product.csv.gz");

CREATE TABLE sqlite_db.vocab_meddra_adverse_effect AS
SELECT 
    meddra_id AS meddra_id,
    meddra_name AS meddra_name,
    meddra_term_type AS meddra_term_type
FROM read_csv("vocab_meddra_adverse_effect.csv.gz");

CREATE TABLE sqlite_db.product_adverse_effect AS
SELECT 
    product_label_id AS product_label_id,
    effect_id AS effect_id,
    label_section AS label_section,
    effect_meddra_id AS effect_meddra_id,
    match_method AS match_method,
    pred0 AS pred0,
    pred1 AS pred1
FROM read_csv("product_adverse_effect.csv.gz");

CREATE TABLE sqlite_db.product_label AS
SELECT 
    label_id AS label_id,
    source AS source,
    source_product_name AS source_product_name,
    source_product_id AS source_product_id,
    source_label_url AS source_label_url
FROM read_csv("product_label.csv.gz");

CREATE TABLE sqlite_db.product_to_rxnorm AS
SELECT 
    label_id AS label_id,
    rxnorm_product_id AS rxnorm_product_id
FROM read_csv("product_to_rxnorm.csv.gz");

CREATE TABLE sqlite_db.vocab_rxnorm_ingredient_to_product AS
SELECT 
    ingredient_id AS ingredient_id,
    product_id AS product_id
FROM read_csv("vocab_rxnorm_ingredient_to_product.csv.gz");

CREATE TABLE sqlite_db.adverse_reactions_all_labels AS
FROM read_csv("adverse_reactions_all_labels.csv.gz");

CREATE TABLE sqlite_db.boxed_warnings_all_labels AS
FROM read_csv("boxed_warnings_all_labels.csv.gz");

CREATE TABLE sqlite_db.boxed_warnings AS
FROM read_csv("boxed_warnings.csv.gz");

CREATE TABLE sqlite_db.high_confidence AS
FROM read_csv("high_confidence.csv.gz");

CREATE TABLE sqlite_db.rxcui_setid_map AS
FROM read_csv("rxcui_setid_map.csv.gz");

CREATE TABLE sqlite_db.rxnorm_product_to_ingredient AS
FROM read_csv("rxnorm_product_to_ingredient.csv.gz");

CREATE TABLE sqlite_db.warnings_and_precautions_all_labels AS
FROM read_csv("warnings_and_precautions_all_labels.csv.gz");

CREATE TABLE sqlite_db.warnings_and_precautions AS
FROM read_csv("warnings_and_precautions.csv.gz");