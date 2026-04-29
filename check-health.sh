#!/bin/bash
echo "=== App (port 3000) ==="
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
echo ""
echo "=== Nginx (port 80) ==="
curl -s -o /dev/null -w "%{http_code}" http://localhost
echo ""
echo "=== Nginx config test ==="
nginx -t 2>&1
echo "=== PM2 ==="
pm2 list
