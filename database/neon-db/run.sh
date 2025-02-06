curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# Install libpq on Windows
# 1. Download the PostgreSQL installer from https://www.postgresql.org/download/windows/
# 2. Run the installer and select only the "PostgreSQL Client" component
# 3. Add the PostgreSQL bin directory to your system PATH (typically C:\Program Files\PostgreSQL\<version>\bin)
echo 'export PATH="/opt/homebrew/opt/libpq/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
npm install -g neonctl
neon connection-string dev/developer_name --database-name neondb --psql
neon db create dev/developer_name --database-name neondb
neon db start dev/developer_name --database-name neondb
neon db connect dev/developer_name --database-name neondb --psql