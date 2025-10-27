#!/bin/bash

# Script para probar el endpoint de predicción de precios.

# Carga el token de autenticación desde el archivo .env (si existe)
if [ -f .env ]; then
    export $(cat .env | grep JWT_SECRET | xargs)
    # Simula la creación de un token simple para prueba (requiere `npm install jsonwebtoken` global o local)
    TOKEN=$(node -e "console.log(require('jsonwebtoken').sign({ id: 1, email: 'test@test.com' }, process.env.JWT_SECRET || 'supersecret'));")
else
    echo "Advertencia: Archivo .env no encontrado. Usando token de prueba genérico."
    TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwiaWF0IjoxNjE2NDI0OTY2fQ.Y_gC-v5qZ1gqWJzYJ-Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Y"
fi

echo "--- Probando el Endpoint de Estimación de Precios ---"

curl -X POST http://localhost:3000/api/estimador/prediccion \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d '{'
    '"tipoPropiedad"': '"Apartamento"',
    '"tipoAlojamiento"': '"entero"',
    '"distrito"': '"Miraflores"',
    '"provincia"': '"Lima"',
    '"huespedes"': 2,
    '"habitaciones"': 1,
    '"camas"': 1,
    '"baños"': 1,
    '"comodidades"': ['"Wifi"', '"Cocina"']
}'

echo "
--- Prueba finalizada ---"
