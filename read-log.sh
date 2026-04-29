#!/bin/bash
tail -30 /var/log/deploy-news.log 2>/dev/null && echo "---" && pm2 list && echo "Port 3000:" && curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 && echo ""
