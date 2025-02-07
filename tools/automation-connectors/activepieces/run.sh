docker run -d -p 8080:80 -v ~/.activepieces:/root/.activepieces -e AP_QUEUE_MODE=MEMORY -e AP_DB_TYPE=SQLITE3 -e AP_FRONTEND_URL="http://localhost:8080" activepieces/activepieces:latest
ngrok http 8080
# docker pull activepieces/activepieces:latest
