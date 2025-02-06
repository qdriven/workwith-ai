docker exec -i d9f1ee024a0c /bin/sh -c "export KONG_ADMIN_GUI_PATH='/'; export KONG_ADMIN_GUI_URL='http://localhost:8002/manager'; kong reload; exit"
