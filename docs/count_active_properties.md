# Documentación: Contador de Propiedades Activas

Este documento describe la funcionalidad del contador de propiedades activas y cómo probarlo.

## Funcionalidad

La característica implementa un contador visual (badge) en la vista principal del dashboard (`3-menu-principal.html`) que muestra el número de propiedades del usuario que se encuentran en estado 'Activa'.

### Comportamiento

- **Carga Inicial:** Al cargar la página, se hace una petición a la API para obtener el número inicial.
- **Actualización Automática:** El contador se actualiza automáticamente cada 60 segundos.
- **Actualización por Foco:** El contador también se refresca cuando el usuario vuelve a la pestaña del navegador después de haber estado en otra.
- **Navegación:** Al hacer clic en el área del contador (o en el texto "Ver mis Propiedades"), el usuario es redirigido a la página del estimador de precios (`9-estimar-precio.html`).
- **Manejo de Errores:** Si la API falla, el contador muestra un ícono de exclamación (`!`). Al hacer clic en él, se reintenta la llamada a la API.

### Caché (Backend)

Para mejorar el rendimiento y no sobrecargar la base de datos, el resultado del conteo se almacena en un caché en el servidor por **60 segundos**. El caché para un usuario específico se invalida automáticamente cuando dicho usuario crea una nueva propiedad.

## Pruebas

### Prueba de Endpoint con cURL

Puedes probar el endpoint directamente usando el script de shell proporcionado.

1.  **Obtén un Token JWT Válido:** Inicia sesión en la aplicación y copia el token que se guarda en `localStorage` en las herramientas de desarrollador de tu navegador.

2.  **Ejecuta el Script:** Edita el archivo `scripts/test_count_active.sh` y reemplaza el valor de la variable `TOKEN` con el que copiaste.

    ```bash
    # Desde la raíz del proyecto
    bash scripts/test_count_active.sh
    ```

3.  **Respuesta Esperada:**

    Deberías recibir una respuesta JSON similar a esta:

    ```json
    {
        "status": "success",
        "data": {
            "count": 5 
        }
    }
    ```
    Donde `5` es el número de propiedades activas para el usuario dueño del token.

### Verificación Manual en la Interfaz

1.  Inicia sesión en la aplicación.
2.  Navega a la página principal (`3-menu-principal.html`).
3.  Verifica que el contador aparezca junto a "Ver mis Propiedades".
4.  Crea una nueva propiedad a través del formulario de registro.
5.  Al volver al menú principal, el contador debería haberse actualizado para reflejar la nueva propiedad (puede tardar hasta 60 segundos si no se invalida el caché, pero la implementación actual lo invalida).
