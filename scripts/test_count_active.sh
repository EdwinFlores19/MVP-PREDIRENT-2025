#!/bin/bash

# Script para probar el endpoint del contador de propiedades activas.

# Reemplaza este token con uno válido para tus pruebas
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwiaWF0IjoxNjE2NDI0OTY2fQ.Y_gC-v5qZ1gqWJzYJ-Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Y"

if [ -z "$TOKEN" ]; then
    echo "Error: La variable TOKEN no está definida. Por favor, edita el script y añade un token JWT válido."
    exit 1
fi

echo "--- Probando el Endpoint de Conteo de Propiedades Activas ---"

curl --location --request GET 'http://localhost:3000/api/propiedades/activas/count' \
--header "Authorization: Bearer $TOKEN" \
--header "Content-Type: application/json"

echo "

--- Prueba finalizada. Verifica que la respuesta contenga un JSON como: {"status":"success","data":{"count":N}} ---"
