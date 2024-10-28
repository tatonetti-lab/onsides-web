ATTACH 'loaded.db' AS sqlite_db (TYPE SQLITE);

DROP TABLE IF EXISTS sqlite_db.ingredients;
DROP TABLE IF EXISTS sqlite_db.rxnormmappings;
DROP TABLE IF EXISTS sqlite_db.adversereactionsactivelabels;
DROP TABLE IF EXISTS sqlite_db.boxedwarningsactivelabels;
DROP TABLE IF EXISTS sqlite_db.warningsandprecautionsactivelabels;
DROP TABLE IF EXISTS sqlite_db.dmsplzipfilesmetadata;
DROP TABLE IF EXISTS sqlite_db.adversereactions;

CREATE TABLE sqlite_db.ingredients AS
FROM read_csv("ingredients.csv.gz");

CREATE TABLE sqlite_db.rxnormmappings AS
SELECT SETID AS set_id, SPL_VERSION AS spl_version, RXCUI AS rx_cui, RXSTRING AS rx_string, RXTTY AS rx_tty
FROM read_csv("rxnorm_mappings.csv.gz");

CREATE TABLE sqlite_db.adversereactionsactivelabels AS
FROM read_csv("adverse_reactions_active_labels.csv.gz");

CREATE TABLE sqlite_db.boxedwarningsactivelabels AS
FROM read_csv("boxed_warnings_active_labels.csv.gz");

CREATE TABLE sqlite_db.warningsandprecautionsactivelabels AS
FROM read_csv("warnings_and_precautions_active_labels.csv.gz");

CREATE TABLE sqlite_db.dmsplzipfilesmetadata AS
SELECT SETID AS set_id, ZIP_FILE_NAME AS zip_file_name, UPLOAD_DATE AS upload_date, SPL_VERSION AS spl_version, TITLE AS title
FROM read_csv("dm_spl_zip_files_meta_data.csv.gz");

CREATE TABLE sqlite_db.adversereactions AS
SELECT pt_meddra_id AS meddra_id, pt_meddra_term AS meddra_name
FROM read_csv("adverse_reactions.csv.gz");
