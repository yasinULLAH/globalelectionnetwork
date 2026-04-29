#!/bin/bash
cd /var/www/globalelectionnetwork
set -a; source .env; set +a

echo "=== Init DB ==="
node scripts/init-db.js 2>&1 | tail -5
node scripts/add-cms-tables.js 2>&1 | tail -3
node scripts/create-posts-table.js 2>&1 | tail -3

echo "=== Build ==="
npm run build 2>&1 | tail -15

echo "=== Start PM2 ==="
pm2 delete globalelection 2>/dev/null || true
pm2 start npm --name globalelection -- start -- -p 3000
pm2 save
pm2 list
