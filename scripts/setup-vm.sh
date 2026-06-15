#!/usr/bin/env bash
set -euo pipefail

# VM deployment automation for CUP-FICCT on Ubuntu 24.04.
# This script installs dependencies, configures DuckDNS, nginx + certbot,
# and starts the Docker Compose application stack.
# Configuration is read from environment variables and/or a root .env file.

DEPLOY_DIR="/opt/cupficct"
REPO_URL="${REPO_URL:-}"
NGINX_CONF_TEMPLATE="${NGINX_CONF_TEMPLATE:-nginx/cupficct.duckdns.org.conf.template}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

fail() {
    log "ERROR: $*" >&2
    exit 1
}

# Prepare the deployment directory first so we can locate a root .env file.
if [[ -n "$REPO_URL" ]]; then
    log "Cloning repository into $DEPLOY_DIR..."
    if [[ -d "$DEPLOY_DIR/.git" ]]; then
        log "Directory already exists; pulling latest changes..."
        git -C "$DEPLOY_DIR" pull
    else
        git clone "$REPO_URL" "$DEPLOY_DIR"
    fi
else
    log "REPO_URL not set; using current directory as deploy source."
    DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fi

cd "$DEPLOY_DIR" || fail "Could not change to $DEPLOY_DIR"

# If no environment variables are exported, source the root .env file when present.
if [[ -z "${DUCKDNS_TOKEN:-}" && -f "$DEPLOY_DIR/.env" ]]; then
    log "No exported environment detected; sourcing $DEPLOY_DIR/.env..."
    set -a
    # shellcheck source=/dev/null
    source "$DEPLOY_DIR/.env"
    set +a
fi

# Ensure required environment variables are present.
if [[ -z "${DUCKDNS_TOKEN:-}" ]]; then
    fail "DUCKDNS_TOKEN is not set. Export it or provide it in a root .env file."
fi

if [[ -z "${DUCKDNS_DOMAIN:-}" ]]; then
    fail "DUCKDNS_DOMAIN is not set. Export it or provide it in a root .env file."
fi

if [[ -z "${DOMAIN:-}" ]]; then
    fail "DOMAIN is not set. Export it or provide it in a root .env file."
fi

if [[ -z "${CERTBOT_EMAIL:-}" ]]; then
    fail "CERTBOT_EMAIL is not set. Export it or provide it in a root .env file."
fi

log "Updating packages..."
apt-get update
apt-get upgrade -y
apt-get install -y \
    docker.io \
    docker-compose-plugin \
    nginx \
    certbot \
    python3-certbot-nginx \
    gettext-base \
    curl \
    git \
    cron

log "Enabling Docker service..."
systemctl enable docker
systemctl start docker

# Persist secrets in a restricted env file inside the deploy directory.
# If a root .env already exists it is preserved; otherwise a minimal one is created.
if [[ -f "$DEPLOY_DIR/.env" ]]; then
    log "Existing $DEPLOY_DIR/.env found; preserving it."
else
    log "Creating $DEPLOY_DIR/.env with deployment secrets..."
    cat > "$DEPLOY_DIR/.env" <<EOF
DUCKDNS_TOKEN=$DUCKDNS_TOKEN
DUCKDNS_DOMAIN=$DUCKDNS_DOMAIN
DOMAIN=$DOMAIN
CERTBOT_EMAIL=$CERTBOT_EMAIL
EOF
    chmod 600 "$DEPLOY_DIR/.env"
fi

# Ensure scripts are executable.
chmod +x scripts/update-duckdns.sh scripts/renew-ssl.sh

# Run an initial DuckDNS update.
log "Running initial DuckDNS update..."
./scripts/update-duckdns.sh

# Schedule recurring DuckDNS updates and certbot renewals.
log "Configuring cron jobs..."
CRON_FILE="/etc/cron.d/cupficct"
cat > "$CRON_FILE" <<EOF
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

*/5 * * * * root cd $DEPLOY_DIR && set -a && source .env && set +a && ./scripts/update-duckdns.sh >> /var/log/duckdns.log 2>&1
0 */12 * * * root cd $DEPLOY_DIR && set -a && source .env && set +a && ./scripts/renew-ssl.sh >> /var/log/letsencrypt/renewal.log 2>&1
EOF
chmod 644 "$CRON_FILE"

# Install nginx site configuration from template.
log "Installing nginx site configuration..."
if [[ ! -f "$NGINX_CONF_TEMPLATE" ]]; then
    fail "Nginx configuration template not found at $DEPLOY_DIR/$NGINX_CONF_TEMPLATE"
fi

envsubst '$DOMAIN' < "$NGINX_CONF_TEMPLATE" > "/etc/nginx/sites-available/${DOMAIN}.conf"
rm -f "/etc/nginx/sites-enabled/${DOMAIN}.conf"
ln -s "/etc/nginx/sites-available/${DOMAIN}.conf" "/etc/nginx/sites-enabled/${DOMAIN}.conf"
rm -f /etc/nginx/sites-enabled/default

# Validate nginx configuration before requesting certificates.
nginx -t || fail "Nginx configuration test failed."

# Obtain SSL certificate.
log "Requesting SSL certificate for $DOMAIN..."
certbot --nginx \
    -d "$DOMAIN" \
    --non-interactive \
    --agree-tos \
    --email "$CERTBOT_EMAIL" \
    --redirect \
    --hsts \
    --staple-ocsp \
    || fail "Certbot certificate request failed."

# Build and start the application stack.
log "Building and starting Docker Compose stack..."
docker compose --env-file .env -f docker/docker-compose.prod.yml down || true
docker compose --env-file .env -f docker/docker-compose.prod.yml pull || true
docker compose --env-file .env -f docker/docker-compose.prod.yml up -d --build

# Restart nginx to pick up the new upstreams and certificate.
log "Restarting nginx..."
systemctl restart nginx

log "Setup complete. The application should be available at https://$DOMAIN"
