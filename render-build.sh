#!/usr/bin/env bash
# exit on error
set -o errexit

# Install backend dependencies
pip install -r requirements.txt

# Install frontend dependencies and build
cd frontend
if [ -f package-lock.json ]; then
  npm ci --no-audit --no-fund
else
  npm install --no-audit --no-fund
fi
npm run build

# Move back to root
cd ..

# Run database migrations (if any)
# python backend/create_db.py  <-- If we had a separate migration script
