docker run -d --name nocodb-postgres \
-v "$(pwd)"/nocodb:/usr/app/data/ \
-p 9091:8080 \
-e NC_DB="pg://db.supabase.orb.local:5432?u=postgres&p=postgres&d=collections" \
-e NC_AUTH_JWT_SECRET="569a1821-0a93-45e8-87ab-eb857f20a010" \
nocodb/nocodb:latest

# test@abc.com/password
