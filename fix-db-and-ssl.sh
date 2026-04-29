#!/bin/bash
set -e

# Fix init-db.js to use localhost
sed -i "s/host: '16.171.198.166'/host: process.env.DB_HOST || 'localhost'/" /var/www/globalelectionnetwork/scripts/init-db.js
sed -i "s/host: '16.171.198.166'/host: process.env.DB_HOST || 'localhost'/" /var/www/globalelectionnetwork/scripts/add-cms-tables.js 2>/dev/null || true
sed -i "s/host: '16.171.198.166'/host: process.env.DB_HOST || 'localhost'/" /var/www/globalelectionnetwork/scripts/create-posts-table.js 2>/dev/null || true

echo "=== Running DB init with localhost ==="
cd /var/www/globalelectionnetwork
export DB_HOST=localhost DB_PORT=5432 DB_USER=pakload DB_PASSWORD='Khan123@#' DB_NAME=elections
node scripts/init-db.js
node scripts/add-cms-tables.js 2>/dev/null || true
node scripts/create-posts-table.js 2>/dev/null || true

echo "=== DB Tables check ==="
sudo -u postgres psql -d elections -c "\dt" 2>/dev/null || true

echo "=== Installing Certbot ==="
apt-get install -y snapd
snap install --classic certbot 2>/dev/null || apt-get install -y certbot python3-certbot-nginx
ln -sf /snap/bin/certbot /usr/bin/certbot 2>/dev/null || true

echo "=== Certbot ready. Run after domain propagates: ==="
echo "certbot --nginx -d globalelectionnetwork.com -d www.globalelectionnetwork.com --non-interactive --agree-tos -m admin@globalelectionnetwork.com"

echo "=== PM2 status ==="
pm2 list
