#!/bin/bash
HASH="886809781cb46bda02c1448a1372507ecb65036b54250494427311f37e5a7cf2"

sudo -u postgres psql -d elections << SQL
-- Remove any other admin users
DELETE FROM users WHERE role = 'admin' AND email != 'admin@gen.pk';

-- Update admin password to hashed Khan@#123
UPDATE users SET
  email = 'admin@gen.pk',
  name = 'Admin',
  password = '$HASH',
  role = 'admin'
WHERE email = 'admin@gen.pk';

-- Confirm
SELECT id, name, email, role, LEFT(password,16)||'...' AS password_preview FROM users WHERE role = 'admin';
SQL
