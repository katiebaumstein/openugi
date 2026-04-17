#!/usr/bin/env bash
# OpenUGI Version B deploy script (local Next.js standalone build -> webhost).
# Run from: openugi/b/
set -euo pipefail

WEBHOST="${WEBHOST:-webhost}"
REMOTE_ROOT="/var/www/openugi-b"
DOMAIN="b.openugi.com"
TARBALL="/tmp/openugi-b-deploy.tar.gz"

echo "==> 1/5 Building Next.js standalone bundle locally..."
npm run build >/dev/null

# Standalone bundle is self-contained, but static & public must be merged in
rm -rf .next/standalone/.next/static .next/standalone/public
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

echo "==> 2/5 Packaging artifacts..."
# What ends up on server:
#   server.js, node_modules/, .next/, public/, ecosystem.config.js, nginx/
tar czf "$TARBALL" \
  --exclude '.DS_Store' \
  -C .next/standalone . \
  -C "$(pwd)" ecosystem.config.js nginx
ls -lh "$TARBALL"

echo "==> 3/5 Uploading to $WEBHOST..."
scp "$TARBALL" "$WEBHOST:/tmp/"

echo "==> 4/5 Remote install + setup..."
ssh "$WEBHOST" bash -euo pipefail << REMOTE
  sudo mkdir -p $REMOTE_ROOT/logs
  sudo chown -R admin:admin $REMOTE_ROOT

  tar xzf /tmp/$(basename "$TARBALL") -C $REMOTE_ROOT

  # Nginx (first deploy only)
  if [ ! -f /etc/nginx/sites-available/$DOMAIN ]; then
    sudo cp $REMOTE_ROOT/nginx/$DOMAIN.conf /etc/nginx/sites-available/$DOMAIN
    sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN
    sudo nginx -t
    sudo systemctl reload nginx
  fi

  # PM2
  if pm2 describe openugi-b >/dev/null 2>&1; then
    pm2 restart openugi-b --update-env
  else
    pm2 start $REMOTE_ROOT/ecosystem.config.js
    pm2 save
  fi

  echo "==> 5/5 Health check..."
  sleep 3
  curl -fsS http://127.0.0.1:4003/api/health | head -c 300; echo
REMOTE

echo "==> Done. If first deploy, grab SSL cert now:"
echo "  ssh $WEBHOST 'sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m admin@tutuhost.com --redirect'"
echo "  curl -I https://$DOMAIN/"
