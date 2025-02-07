docker run -d --name nocodb-postgres \
# -v "$(pwd)"/nocodb:/usr/app/data/ \
-p 9090:8080 \
-e NC_DB="pg://supabase_db_dev-stacks.orb.local:5432?u=postgres&p=postgres&d=nocodb" \
-e NC_AUTH_JWT_SECRET="569a1821-0a93-45e8-87ab-eb857f20a010" \
nocodb/nocodb:latest


# test@abc.com/password