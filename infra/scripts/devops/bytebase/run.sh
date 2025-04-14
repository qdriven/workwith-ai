docker run --rm --init \
  --env-file .env \
  --name bytebase \
  --publish 8089:8080 --pull always \
  bytebase/bytebase:2.22.3
