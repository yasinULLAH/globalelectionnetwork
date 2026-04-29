#!/bin/bash
set -e

echo "=== 1. System update ==="
apt-get update -y && apt-get upgrade -y

echo "=== 2. Install Node.js 20 ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

echo "=== 3. Install PostgreSQL ==="
apt-get install -y postgresql postgresql-contrib

echo "=== 4. Start PostgreSQL ==="
systemctl start postgresql
systemctl enable postgresql

echo "=== 5. Setup DB user and database ==="
sudo -u postgres psql -c "CREATE USER pakload WITH PASSWORD 'Khan123@#';" 2>/dev/null || echo "User exists"
sudo -u postgres psql -c "CREATE DATABASE elections OWNER pakload;" 2>/dev/null || echo "DB exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE elections TO pakload;"

echo "=== 6. Install PM2 ==="
npm install -g pm2

echo "=== 7. Clone app ==="
mkdir -p /var/www
cd /var/www
rm -rf globalelectionnetwork
git clone https://github.com/awakeelkhan/globalelectionnetwork.git
cd globalelectionnetwork

echo "=== 8. Write .env ==="
cat > .env << 'EOF'
DB_HOST=localhost
DB_PORT=5432
DB_USER=pakload
DB_PASSWORD=Khan123@#
DB_NAME=elections
NODE_ENV=production
NEXTAUTH_SECRET=gen_secret_xyz_2026
NEXTAUTH_URL=http://16.170.159.107:3000
EOF

echo "=== 9. Install dependencies ==="
npm install --legacy-peer-deps

echo "=== 10. Init database schema ==="
node scripts/init-db.js || echo "Init DB done/skipped"
node scripts/add-cms-tables.js || echo "CMS tables done/skipped"

echo "=== 11. Build app ==="
npm run build

echo "=== 12. Start with PM2 ==="
pm2 delete globalelection 2>/dev/null || true
pm2 start npm --name "globalelection" -- start -- -p 3000
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu | tail -1 | bash || true

echo "=== DONE === App running at http://16.170.159.107:3000"
pm2 status
