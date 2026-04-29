#!/bin/bash
cd /var/www/globalelectionnetwork
export DB_HOST=localhost DB_PORT=5432 DB_USER=pakload DB_PASSWORD='Khan123@#' DB_NAME=elections NODE_ENV=production NEXTAUTH_SECRET=GEN_election_secret_2026 NEXTAUTH_URL=https://globalelectionnetwork.com
pm2 delete globalelection 2>/dev/null || true
pm2 start npm --name globalelection -- start -- -p 3000
pm2 save
pm2 list
