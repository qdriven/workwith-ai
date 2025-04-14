docker run \
  -d \
  --name baserow \
  -e BASEROW_PUBLIC_URL=http://localhost \
  -v baserow_data:/baserow/data \
  -p 80:80 \
  -p 443:443 \
  --restart unless-stopped \
  baserow/baserow:1.28.0


  # docker run \
  #   -d \
  #   --name baserow \
  #   -e BASEROW_PUBLIC_URL=https://www.yourdomain.com \
  #   -e DATABASE_HOST=TODO \
  #   -e DATABASE_NAME=TODO \
  #   -e DATABASE_USER=TODO \
  #   -e DATABASE_PASSWORD=TODO \
  #   -e DATABASE_PORT=TODO \
  #   -v baserow_data:/baserow/data \
  #   -p 80:80 \
  #   -p 443:443 \
  #   --restart unless-stopped \
  #   baserow/baserow:1.28.0
