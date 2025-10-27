#!/bin/bash

# Script para probar el endpoint que devuelve las propiedades de un usuario.

# Reemplaza este token con uno válido para tus pruebas
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwiaWF0IjoxNjE2NDI0OTY2fQ.Y_gC-v5qZ1gqWJzYJ-Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Y"

if [ -z "$TOKEN" ]; then
    echo "Error: La variable TOKEN no está definida. Por favor, edita el script y añade un token JWT válido."
    exit 1
fi

echo "--- Probando el Endpoint de Obtención de Propiedades ---"

curl --location --request GET 'http://localhost:3000/api/propiedades/mis-propiedades' \
--header "Authorization: Bearer $TOKEN" \
--header "Content-Type: application/json"

echo "

--- Prueba finalizada. Verifica que la respuesta contenga un JSON con la lista de propiedades. ---"
