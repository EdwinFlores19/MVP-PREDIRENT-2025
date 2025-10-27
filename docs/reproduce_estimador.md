# Documentación: Reproducción y Prueba del Módulo Estimador

Este documento describe los pasos para verificar y probar la funcionalidad del estimador de precios y el listado de propiedades.

## 1. Visión General de la Funcionalidad

- **Contador de Propiedades Activas:** En la página principal, un badge muestra el número de propiedades activas del usuario. Este contador se actualiza periódicamente y al volver a la pestaña.
- **Listado de Propiedades en Estimador:** Al hacer clic en el contador o en la opción del menú, el usuario navega a la vista del estimador (`9-estimar-precio.html`), donde se deben listar todas sus propiedades registradas.
- **Estimación de Precio:** Al seleccionar una propiedad de la lista, el usuario puede solicitar una estimación de precio, que se calcula a través del backend.

## 2. Verificación de la Corrección

Sigue estos pasos para asegurar que la reparación fue exitosa.

### Paso 2.1: Probar el Contador de Propiedades Activas

1.  **Inicia el servidor** de Node.js (`node server.js`).
2.  **Abre la aplicación** e inicia sesión con un usuario que tenga propiedades registradas.
3.  **Navega al menú principal** (`3-menu-principal.html`).
4.  **Verifica** que junto a "Ver mis Propiedades" aparece un badge naranja con un número. Este número debe corresponder a las propiedades cuyo `EstadoPropiedad` es 'Activa' en la base de datos para ese usuario.
5.  **Prueba el script de test:**
    - Edita `scripts/test_count_active.sh` y reemplaza el token de ejemplo por el token de tu sesión actual.
    - Ejecuta `bash scripts/test_count_active.sh` en tu terminal.
    - La salida debe ser un JSON con el conteo correcto: `{"status":"success","data":{"count":N}}`.

### Paso 2.2: Probar el Listado de Propiedades en el Estimador

1.  Desde el menú principal, haz clic en el área de "Ver mis Propiedades" (que ahora incluye el contador).
2.  **Verifica** que eres redirigido a `9-estimar-precio.html`.
3.  **Observa la sección "Selecciona una Propiedad".** Debería mostrar una lista de todas las propiedades registradas para tu usuario, con su título y detalles.
4.  **Prueba el script de test:**
    - Edita `scripts/test_get_my_properties.sh` con tu token actual.
    - Ejecuta `bash scripts/test_get_my_properties.sh`.
    - La salida debe ser un JSON con la lista de tus propiedades: `{"status":"success","data":[{"_id":1,"titulo":"..."}, ...]}`.

### Paso 2.3: Probar la Estimación de Precio

1.  En la vista del estimador, selecciona una de tus propiedades de la lista.
2.  Haz clic en el botón **"Calcular Precio Sugerido"** (nota: este botón debe ser añadido al HTML si no existe).
3.  **Verifica** que aparece un precio sugerido. Si tu entorno de Python no está corriendo, verás una "estimación básica", lo cual es correcto.
4.  **Prueba el script de test:**
    - Edita `scripts/test_estimador.sh` con tu token.
    - Ejecuta `bash scripts/test_estimador.sh`.
    - La salida debe ser un JSON con la predicción: `{"status":"success","data":{"precio_predicho":...}}`.

## 3. Diagnóstico de Errores Futuros

- Si el contador o la lista de propiedades fallan, abre la consola del desarrollador (F12) en el navegador y la terminal de tu servidor Node.js. Ambos han sido instrumentados con logs detallados que indicarán el origen del error (ej. error de red, error de base de datos, etc.).
- El error más común en el lado del estimador será un fallo al ejecutar el script de Python. Asegúrate de haber seguido las instrucciones en `python/README.md` para instalar las dependencias en un entorno virtual.
