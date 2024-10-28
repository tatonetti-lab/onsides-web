cd data/20240925

set -e

rm -f loaded.db

cat ../../load.sql | duckdb
cat ../../format.sql | sqlite3 loaded.db

mv loaded.db ../../database.db
