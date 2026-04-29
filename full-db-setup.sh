#!/bin/bash
HASH="886809781cb46bda02c1448a1372507ecb65036b54250494427311f37e5a7cf2"

cd /var/www/globalelectionnetwork

# Fix hardcoded IP in scripts
sed -i "s/host: '16.171.198.166'/host: process.env.DB_HOST || 'localhost'/" scripts/init-db.js 2>/dev/null || true
sed -i "s/host: '16.171.198.166'/host: process.env.DB_HOST || 'localhost'/" scripts/add-cms-tables.js 2>/dev/null || true
sed -i "s/host: '16.171.198.166'/host: process.env.DB_HOST || 'localhost'/" scripts/create-posts-table.js 2>/dev/null || true

# Run init
export DB_HOST=localhost DB_PORT=5432 DB_USER=pakload DB_PASSWORD='Khan123@#' DB_NAME=elections
node scripts/init-db.js
node scripts/add-cms-tables.js 2>/dev/null || true
node scripts/create-posts-table.js 2>/dev/null || true

# Set correct admin password
sudo -u postgres psql -d elections -c "UPDATE users SET password = '$HASH', email = 'admin@gen.pk', name = 'Admin', role = 'admin' WHERE email = 'admin@gen.pk';"
sudo -u postgres psql -d elections -c "DELETE FROM users WHERE role = 'admin' AND email != 'admin@gen.pk';"
sudo -u postgres psql -d elections -c "SELECT name, email, role, LEFT(password,20)||'...' AS pw FROM users WHERE role='admin';"

echo "=== DONE ==="
