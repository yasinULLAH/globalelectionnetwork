#!/bin/bash
echo "=== Killing stuck build processes ==="
pkill -f "next build" 2>/dev/null || true
pkill -9 -f "next build" 2>/dev/null || true
sleep 2

echo "=== Free memory ==="
free -m

echo "=== Restarting PM2 ==="
cd /var/www/globalelectionnetwork
pm2 restart globalelection 2>&1 || pm2 start npm --name globalelection -- start -- -p 3000 2>&1
pm2 save 2>&1
sleep 8

echo "=== PM2 status ==="
pm2 list 2>&1

echo "=== HTTP check ==="
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 && echo ""
