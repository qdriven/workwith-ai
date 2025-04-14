docker run \
  -d \
  --name baserow \
  --add-host host.docker.internal:host-gateway \
  -e BASEROW_PUBLIC_URL=http://localhost \
  -e DATABASE_HOST=db.supabase.orb.local \
  -e DATABASE_PORT=5432 \
  -e DATABASE_NAME=collections \
  -e DATABASE_USER=postgres \
  -e DATABASE_PASSWORD=postgres \
  --restart unless-stopped \
  -v baserow_data:/baserow/data \
  -p 80:80 \
  -p 443:443 \
  baserow/baserow:1.31.1
