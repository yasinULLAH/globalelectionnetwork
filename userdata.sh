#!/bin/bash
exec > /var/log/setup.log 2>&1
set -e

# 1. Update system
apt-get update -y

# 2. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs git

# 3. Install PostgreSQL
apt-get install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# 4. Setup DB
sudo -u postgres psql -c "CREATE USER pakload WITH PASSWORD 'Khan123@#';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE elections OWNER pakload;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE elections TO pakload;" || true

# 5. Install PM2 & nginx
npm install -g pm2
apt-get install -y nginx

# 6. Clone repo
mkdir -p /var/www
cd /var/www
rm -rf globalelectionnetwork
git clone https://github.com/awakeelkhan/globalelectionnetwork.git
cd globalelectionnetwork

# 7. Write .env
cat > .env << 'ENVEOF'
DB_HOST=localhost
DB_PORT=5432
DB_USER=pakload
DB_PASSWORD=Khan123@#
DB_NAME=elections
NODE_ENV=production
NEXTAUTH_SECRET=GEN_election_secret_2026
NEXTAUTH_URL=http://globalelectionnetwork.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@globalelectionnetwork.com
SMTP_PASS=
ENVEOF

# 8. Install deps & init DB schema
npm install --legacy-peer-deps
node scripts/init-db.js || true
node scripts/add-cms-tables.js || true
node scripts/create-posts-table.js || true

# 9. Build
npm run build

# 10. Start with PM2
pm2 delete globalelection 2>/dev/null || true
pm2 start npm --name "globalelection" -- start -- -p 3000
pm2 save
env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu | tail -1 | bash || true

# 11. Nginx reverse proxy
cat > /etc/nginx/sites-available/globalelection << 'NGINXEOF'
server {
    listen 80 default_server;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/globalelection /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
systemctl enable nginx

echo "=== SETUP COMPLETE ===" >> /var/log/setup.log
