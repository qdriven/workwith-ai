#!/bin/sh
docker run -d -p 30010:3000 -v /root/metabase/metabase.db:/metabase.db --name metabase metabase/metabase

# User/Password: abc@test.com/QA123987
# docker run -d -p 3000:3000 \
#   -e "MB_DB_TYPE=postgres" \
#   -e "MB_DB_DBNAME=metabaseappdb" \
#   -e "MB_DB_PORT=5432" \
#   -e "MB_DB_USER=name" \
#   -e "MB_DB_PASS=password" \
#   -e "MB_DB_HOST=my-database-host" \
#    --name metabase metabase/metabase

# docker run -d -p 3000:3000 \
#   -v ~/metabase-data:/metabase-data \
#   -e "MB_DB_FILE=/metabase-data/metabase.db" \
#   --name metabase metabase/metabase


