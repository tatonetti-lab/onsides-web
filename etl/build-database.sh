cd data/20240925

set -e

rm -f loaded.db

cat ../../etl/load.sql | duckdb
cat ../../etl/format.sql | sqlite3 loaded.db

mv loaded.db ../../database.db
