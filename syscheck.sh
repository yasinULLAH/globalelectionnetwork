#!/bin/bash
echo "=== Memory ==="
free -m
echo "=== Node procs ==="
ps aux --sort=-%mem | grep -E "node|npm|next" | grep -v grep | head -8
echo "=== PM2 ==="
pm2 list 2>&1 | cat
echo "=== Port 3000 ==="
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 && echo ""
echo "=== Swap ==="
swapon --show 2>/dev/null || echo "no swap"
