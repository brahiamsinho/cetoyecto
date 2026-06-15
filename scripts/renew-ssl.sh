#!/usr/bin/env bash
set -euo pipefail

# Renew Let's Encrypt certificates and reload nginx.
# Sources the root .env file when no environment variables are exported so it
# can be invoked consistently from cron.

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

# Source the root .env file when no environment variables are exported.
if [[ -z "${DUCKDNS_TOKEN:-}" && -f "$(dirname "${BASH_SOURCE[0]}")/../.env" ]]; then
    set -a
    # shellcheck source=/dev/null
    source "$(dirname "${BASH_SOURCE[0]}")/../.env"
    set +a
fi

log "Renewing SSL certificates..."
certbot renew --quiet --nginx

log "Reloading nginx..."
systemctl reload nginx

log "SSL renewal complete."
