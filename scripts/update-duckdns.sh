#!/usr/bin/env bash
set -euo pipefail

# Update DuckDNS dynamic DNS record for the configured domain.
# Reads DUCKDNS_TOKEN and DUCKDNS_DOMAIN from the environment or a root .env file.

LOG_FILE="/var/log/duckdns.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

fail() {
    log "ERROR: $*" >&2
    exit 1
}

# Source the root .env file when no environment variables are exported.
if [[ -z "${DUCKDNS_TOKEN:-}" && -f "$(dirname "${BASH_SOURCE[0]}")/../.env" ]]; then
    set -a
    # shellcheck source=/dev/null
    source "$(dirname "${BASH_SOURCE[0]}")/../.env"
    set +a
fi

if [[ -z "${DUCKDNS_TOKEN:-}" ]]; then
    fail "DUCKDNS_TOKEN is not set."
fi

if [[ -z "${DUCKDNS_DOMAIN:-}" ]]; then
    fail "DUCKDNS_DOMAIN is not set."
fi

# Create log directory if needed.
mkdir -p "$(dirname "$LOG_FILE")"

RESPONSE=$(curl -fsS "https://www.duckdns.org/update?domains=${DUCKDNS_DOMAIN}&token=${DUCKDNS_TOKEN}&ip=" 2>&1) || {
    fail "DuckDNS update request failed: $RESPONSE"
}

log "DuckDNS update for ${DUCKDNS_DOMAIN}: ${RESPONSE}" >> "$LOG_FILE"

if [[ "$RESPONSE" != "OK" ]]; then
    fail "DuckDNS update returned unexpected response: ${RESPONSE}"
fi
