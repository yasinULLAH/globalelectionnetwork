#!/bin/bash
set -e
cd /var/www/globalelectionnetwork

echo "=== Pulling latest code ==="
git pull origin master

echo "=== Installing deps ==="
npm ci --prefer-offline 2>/dev/null || npm install

echo "=== Building ==="
export NODE_ENV=production
export DB_HOST=localhost DB_PORT=5432 DB_USER=pakload DB_PASSWORD='Khan123@#' DB_NAME=elections
export NEXTAUTH_SECRET=GEN_election_secret_2026
export NEXTAUTH_URL=https://globalelectionnetwork.com
npm run build

echo "=== Restarting PM2 ==="
pm2 restart globalelection || pm2 start npm --name globalelection -- start -- -p 3000
pm2 save

echo "=== Seeding news articles ==="
bash /var/www/globalelectionnetwork/seed-news.sh

echo "=== Done ==="
pm2 list
