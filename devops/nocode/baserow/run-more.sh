echo "your_redis_password" > .your_redis_password
echo "your_secret_key" > .your_secret_key
echo "your_pg_password" > .your_pg_password
docker run \
  -d \
  --name baserow \
  -e BASEROW_PUBLIC_URL=http://localhost \
  -e REDIS_PASSWORD_FILE=/baserow/.your_redis_password \
  -e SECRET_KEY_FILE=/baserow/.your_secret_key \
  -e DATABASE_PASSWORD_FILE=/baserow/.your_pg_password \
  -e EMAIL_SMTP_PASSWORD_FILE=/baserow/.your_smtp_password \
  --restart unless-stopped \
  -v $PWD/.your_redis_password:/baserow/.your_redis_password \
  -v $PWD/.your_secret_key:/baserow/.your_secret_key \
  -v $PWD/.your_pg_password:/baserow/.your_pg_password \
  -v baserow_data:/baserow/data \
  -p 80:80 \
  -p 443:443 \
  baserow/baserow:1.31.1
