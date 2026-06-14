#!/bin/bash
TOKEN="${API_TOKEN}"

echo "Testing Gemini endpoint..."
RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Resumen de postulantes","formatos":["html"]}' \
  http://localhost:8000/api/reportes/personalizado 2>&1)

echo "$RESPONSE"
