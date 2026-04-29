#!/bin/bash
sudo -u postgres psql -d elections -c "SELECT name, email, role, LEFT(password,20) AS pw_prefix FROM users WHERE role='admin';"
sudo -u postgres psql -d elections -c "SELECT COUNT(*) as total_users FROM users;"
