#!/bin/bash
echo "=== PM2 ==="
pm2 list
echo "=== Port 3000 ==="
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "DOWN"
echo ""
echo "=== Port 80 ==="
curl -s -o /dev/null -w "%{http_code}" http://localhost || echo "DOWN"
echo ""
echo "=== Build log tail ==="
tail -20 /var/log/deploy-news.log 2>/dev/null || echo "no log"
