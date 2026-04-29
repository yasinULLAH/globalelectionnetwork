#!/bin/bash
CONF=/etc/nginx/sites-available/globalelection

# Add IPv6 listen directives if not present
grep -q "\[::\]:80" $CONF || sed -i 's/listen 80 default_server;/listen 80 default_server;\n    listen [::]:80 default_server;/' $CONF
grep -q "\[::\]:443" $CONF || sed -i '/listen 443 ssl/a\    listen [::]:443 ssl;' $CONF

nginx -t && systemctl reload nginx
echo "nginx IPv6 enabled OK"
nginx -T 2>/dev/null | grep "listen"
