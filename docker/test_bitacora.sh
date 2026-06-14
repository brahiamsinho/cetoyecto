#!/bin/bash
TOKEN="${API_TOKEN}"
TIMESTAMP=$(date +%s)

echo "Creating test aula..."
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d "{\"nombre\":\"Aula Test Bolivia\",\"codigo\":\"ATB-$TIMESTAMP\",\"capacidad\":50}" \
  http://localhost:8000/api/aulas

echo ""
echo "Checking bitacora..."
sleep 2

curl -s -X GET \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" \
  "http://localhost:8000/api/bitacora?per_page=1"

echo ""
echo "Test done!"
