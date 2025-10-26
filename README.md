PrediRent - Plataforma de Gestión y Estimación para Propietarios
PrediRent es una aplicación web diseñada para ayudar a los propietarios de inmuebles a gestionar sus propiedades, estimar precios de alquiler óptimos basados en datos, interactuar con una comunidad y generar reportes financieros y de ocupación.

✨ Características Principales
Autenticación Segura: Sistema de registro e inicio de sesión con hash de contraseñas (bcryptjs) y autenticación basada en JSON Web Tokens (JWT).

Dashboard Principal: Vista general con métricas clave como propiedades activas, ingresos mensuales y tasa de ocupación.

Registro de Propiedades: Formulario guiado por pasos para añadir nuevas propiedades con detalles como tipo, metraje, comodidades, seguridad y descripción.

Estimador de Precios: Herramienta que calcula un precio de alquiler recomendado basado en las características de la propiedad y datos comparativos del mercado local.

Comunidad de Propietarios: Sección para buscar y contactar a otros propietarios, filtrando por distrito o áreas de interés, con mensajería privada.

Generación de Reportes: Permite crear reportes personalizados (PDF/JSON) sobre finanzas, ocupación y mantenimiento para propiedades y periodos específicos.

Centro de Notificaciones: Muestra alertas de mercado, mensajes nuevos y actualizaciones importantes de la plataforma.

🛠️ Tecnologías Utilizadas
Backend: Node.js, Express.js

Base de Datos: SQL Server (diseñado para LocalDB en desarrollo)

Frontend: HTML5, CSS3, JavaScript (Vanilla JS)

Autenticación: JSON Web Tokens (JWT), bcryptjs (para hashing)

Manejo de Conexión BD: mssql (Node.js driver)

Validación: express-validator

Variables de Entorno: dotenv

CORS: cors

🚀 Cómo Configurar y Ejecutar el Proyecto (Después de Clonar)
Sigue estos pasos para poner en marcha PrediRent en tu entorno local:

1. Prerrequisitos
Node.js y npm: Asegúrate de tener Node.js instalado (incluye npm). Puedes descargarlo desde nodejs.org.

SQL Server LocalDB: Necesitas tener una instancia de SQL Server LocalDB ejecutándose. La instancia por defecto suele ser (localdb)\MSSQLLocalDB. Puedes instalarla como parte de SQL Server Express o Visual Studio.

Gestor de Base de Datos: Una herramienta como Azure Data Studio o SQL Server Management Studio (SSMS) para ejecutar el script de creación de la base de datos.

2. Clonar el Repositorio
Bash

git clone https://github.com/EdwinFlores19/MVP-PREDIRENT-2025.git
cd MVP-PREDIRENT-2025
3. Instalar Dependencias
Una vez dentro de la carpeta del proyecto, instala todos los paquetes necesarios que están listados en package.json.

Bash

npm install
4. Configurar Variables de Entorno
Este proyecto utiliza un archivo .env para manejar las variables sensibles (como las credenciales de la base de datos y los secretos de JWT).

Crea un archivo llamado .env en la raíz del proyecto.

Copia y pega el siguiente contenido, ajustándolo a tu configuración local:

Code snippet

# Configuración de la Base de Datos (SQL Server LocalDB)
# Reemplaza (localdb)\MSSQLLocalDB si tu instancia tiene otro nombre
DB_SERVER=(localdb)\MSSQLLocalDB
DB_DATABASE=PrediRentDB
DB_USER=
DB_PASSWORD=
DB_PORT=1433

# Opciones de la librería MSSQL
DB_OPTIONS_ENCRYPT=false
DB_OPTIONS_TRUSTSERVERCERTIFICATE=true

# Secreto para JSON Web Token (JWT)
# Puedes generar uno aleatorio y seguro
JWT_SECRET=tu_secreto_muy_seguro_para_jwt

# Puerto del servidor
PORT=3000
Nota: Para DB_USER y DB_PASSWORD, si usas la autenticación de Windows en LocalDB, puedes dejarlos vacíos y la conexión (mssql) debería usar la autenticación integrada. Si tienes un usuario SQL específico, ingrésalo allí.

5. Configurar la Base de Datos
Usando Azure Data Studio o SSMS, conéctate a tu instancia de LocalDB.

Crea la base de datos (si no existe).

SQL

CREATE DATABASE PrediRentDB;
Ejecuta el script de creación de tablas (ej. schema.sql o similar) para poblar la base de datos con la estructura necesaria.

6. Iniciar el Servidor
Una vez que la base de datos esté lista y el .env configurado, puedes iniciar el servidor.

Bash

npm start
¡El servidor de PrediRent ahora estará escuchando en http://localhost:3000!

📁 Estructura del Proyecto
/
├── Controller/     # Lógica de negocio y manejo de peticiones (req, res)
├── Model/          # Conexión a BD, consultas SQL y lógica de datos
├── View/           # Archivos HTML, CSS y JS del cliente
├── .env            # (Ignorado por Git) Variables de entorno locales
├── .gitignore      # Archivos y carpetas ignorados por Git
├── server.js       # Archivo principal, configuración de Express y rutas
├── package.json    # Dependencias y scripts del proyecto
└── README.md       # Este archivo
🌐 API Endpoints (Ejemplos)
Aquí hay una lista de los principales endpoints de la API para interactuar con el backend:

Autenticación
POST /api/auth/register: Registra un nuevo usuario.

POST /api/auth/login: Inicia sesión y devuelve un JWT.

Propiedades
GET /api/propiedades: Obtiene la lista de propiedades del usuario.

POST /api/propiedades: Crea una nueva propiedad.

GET /api/propiedades/:id: Obtiene detalles de una propiedad específica.

Estimador
POST /api/estimador/calcular: Recibe datos de una propiedad y devuelve un alquiler estimado.

📄 Licencia
Derechos Reservador - Predirent 2025
