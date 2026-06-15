#!/usr/bin/env bash
set -euo pipefail

# Render the nginx template and re-apply certbot SSL so the 443 block is
# preserved. Run this from the repository root after changing the template.

DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NGINX_TEMPLATE="${DEPLOY_DIR}/nginx/cupficct.duckdns.org.conf.template"

cd "$DEPLOY_DIR" || exit 1

if [[ ! -f "$NGINX_TEMPLATE" ]]; then
    echo "ERROR: template not found at $NGINX_TEMPLATE" >&2
    exit 1
fi

# Export all variables from root .env so envsubst can use them.
if [[ -f "$DEPLOY_DIR/.env" ]]; then
    set -a
    # shellcheck source=/dev/null
    source "$DEPLOY_DIR/.env"
    set +a
fi

if [[ -z "${DOMAIN:-}" ]]; then
    echo "ERROR: DOMAIN is not set. Provide it in $DEPLOY_DIR/.env or export it." >&2
    exit 1
fi

if [[ -z "${CERTBOT_EMAIL:-}" ]]; then
    echo "ERROR: CERTBOT_EMAIL is not set. Provide it in $DEPLOY_DIR/.env or export it." >&2
    exit 1
fi

CONF_PATH="/etc/nginx/sites-available/${DOMAIN}.conf"
LINK_PATH="/etc/nginx/sites-enabled/${DOMAIN}.conf"

echo "Rendering nginx config for $DOMAIN..."
mkdir -p "$(dirname "$CONF_PATH")"
envsubst '$DOMAIN' < "$NGINX_TEMPLATE" > "$CONF_PATH"

# Ensure the site is enabled.
rm -f "$LINK_PATH"
ln -s "$CONF_PATH" "$LINK_PATH"
rm -f /etc/nginx/sites-enabled/default

echo "Re-applying certbot SSL configuration..."
# Re-run certbot so it adds/updates the 443 SSL block on top of the template.
certbot --nginx \
    -d "$DOMAIN" \
    --non-interactive \
    --agree-tos \
    --email "$CERTBOT_EMAIL" \
    --redirect \
    --hsts \
    --staple-ocsp

nginx -t
systemctl reload nginx

echo "Nginx config updated for https://$DOMAIN"
