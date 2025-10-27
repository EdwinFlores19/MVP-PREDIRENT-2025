#!/bin/bash

# Script para probar el registro de una nueva propiedad.

if [ -f .env ]; then
    export $(cat .env | grep JWT_SECRET | xargs)
    TOKEN=$(node -e "console.log(require('jsonwebtoken').sign({ id: 1, email: 'test@test.com' }, process.env.JWT_SECRET || 'supersecret'));")
else
    echo "Advertencia: Archivo .env no encontrado. Usando token de prueba genérico."
    TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwiaWF0IjoxNjE2NDI0OTY2fQ.Y_gC-v5qZ1gqWJzYJ-Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Y"
fi

echo "--- Probando el Endpoint de Registro de Propiedad ---"

curl -X POST http://localhost:3000/api/propiedades \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d '{
    "tipoPropiedad": "Casa de Prueba",
    "tipoAlojamiento": "entero",
    "pais": "PE",
    "direccion": "Calle de Prueba 123",
    "apartamento": "",
    "distrito": "Test District",
    "codigoPostal": "15000",
    "provincia": "Test Province",
    "mostrarUbicacionExacta": true,
    "huespedes": 1,
    "habitaciones": 1,
    "camas": 1,
    "baños": 1,
    "comodidades": ["Wifi"],
    "comodidadesDestacadas": [],
    "seguridad": [],
    "titulo": "Propiedad Mínima para Prueba",
    "descripcion": "Descripción mínima.",
    "aspectos": [],
    "calcularPrecio": false
}'

echo "
--- Prueba finalizada. Revisa los logs del servidor para confirmar el éxito de la transacción. ---"
