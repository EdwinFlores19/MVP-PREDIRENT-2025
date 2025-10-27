/*
================================================================================
    SCRIPT DE CREACIÓN DE BASE DE DATOS PARA PREDIRENT (ACTUALIZADO)
    SGBD: SQL Server
    AUTOR: (Análisis de Experto)
    FECHA: 27 de octubre de 2025 (Refleja cambios solicitados)
================================================================================
    NOTAS DE DISEÑO:
    1.  NOMENCLATURA: Se utiliza PascalCase para tablas y columnas.
    2.  TIPOS DE DATOS: Se prioriza NVARCHAR para soporte Unicode, DATETIME2
        para precisión en fechas, DECIMAL para valores monetarios y métricos,
        y BIT para valores booleanos.
    3.  CLAVES: Se usan claves primarias autoincrementales (INT IDENTITY) para
        simplicidad y rendimiento en índices clusterizados.
    4.  INTEGRIDAD: Se definen CONSTRAINTS (FOREIGN KEY, UNIQUE, CHECK, DEFAULT)
        para garantizar la calidad de los datos a nivel de base de datos.
    5.  ÍNDICES: Se crean índices no clusterizados (NONCLUSTERED INDEX) en todas
        las claves foráneas (FK) y en columnas usadas comúnmente para búsquedas
        (ej. Email, Distrito) para optimizar el rendimiento de las consultas.
================================================================================
*/

-- Creación de la base de datos (Opcional, si no existe)
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'PrediRentDB')
BEGIN
    CREATE DATABASE PrediRentDB;
END
GO

USE PrediRentDB;
GO

-- ============================================================================
-- SECCIÓN 1: AUTENTICACIÓN Y GESTIÓN DE USUARIOS
-- ============================================================================
-- Tabla principal para almacenar a los propietarios (usuarios)
CREATE TABLE dbo.Usuarios (
    UsuarioID INT IDENTITY(1,1) NOT NULL,
    NombreCompleto NVARCHAR(255) NOT NULL,
    Email NVARCHAR(255) NOT NULL,
    PasswordHash NVARCHAR(MAX) NOT NULL, -- Almacenar siempre el hash, nunca texto plano
    Distrito NVARCHAR(100) NULL,
    AvatarURL NVARCHAR(512) NULL,
    EsVerificado BIT NOT NULL CONSTRAINT DF_Usuarios_EsVerificado DEFAULT 0,
    UltimaConexion DATETIME2(3) NULL,
    FechaRegistro DATETIME2(3) NOT NULL CONSTRAINT DF_Usuarios_FechaRegistro DEFAULT GETDATE(),
    EstadoUsuario NVARCHAR(20) NOT NULL CONSTRAINT DF_Usuarios_EstadoUsuario DEFAULT 'Activo',

    CONSTRAINT PK_Usuarios PRIMARY KEY CLUSTERED (UsuarioID),
    CONSTRAINT UQ_Usuarios_Email UNIQUE NONCLUSTERED (Email),
    CONSTRAINT CK_Usuarios_EstadoUsuario CHECK (EstadoUsuario IN ('Activo', 'Inactivo', 'PendienteValidacion', 'Suspendido'))
);
GO

-- Índice para búsquedas por distrito (visto en la comunidad)
CREATE NONCLUSTERED INDEX IX_Usuarios_Distrito ON dbo.Usuarios(Distrito) WHERE Distrito IS NOT NULL;
GO

-- Tabla para gestionar inicios de sesión con redes sociales (Google, Facebook)
CREATE TABLE dbo.UsuarioSocialLogins (
    UsuarioSocialLoginID INT IDENTITY(1,1) NOT NULL,
    UsuarioID INT NOT NULL,
    Proveedor NVARCHAR(50) NOT NULL, -- Ej: 'Google', 'Facebook'
    ProveedorID NVARCHAR(255) NOT NULL,

    CONSTRAINT PK_UsuarioSocialLogins PRIMARY KEY CLUSTERED (UsuarioSocialLoginID),
    CONSTRAINT FK_UsuarioSocialLogins_UsuarioID FOREIGN KEY (UsuarioID)
        REFERENCES dbo.Usuarios(UsuarioID) ON DELETE CASCADE,
    CONSTRAINT UQ_UsuarioSocialLogins_Proveedor_ID UNIQUE NONCLUSTERED (Proveedor, ProveedorID)
);
GO

CREATE NONCLUSTERED INDEX IX_UsuarioSocialLogins_UsuarioID ON dbo.UsuarioSocialLogins(UsuarioID);
GO


-- ============================================================================
-- SECCIÓN 2: GESTIÓN DE PROPIEDADES (Núcleo del sistema) - ACTUALIZADO
-- ============================================================================

-- Tabla principal de propiedades (CON CAMBIOS INCORPORADOS)
CREATE TABLE dbo.Propiedades (
    PropiedadID INT IDENTITY(1,1) NOT NULL,
    UsuarioID INT NOT NULL,
    Titulo NVARCHAR(255) NOT NULL,
    Descripcion NVARCHAR(MAX) NULL,
    TipoPropiedad NVARCHAR(50) NOT NULL, -- Ej: 'Casa', 'Departamento', 'Oficina', 'Estudio', 'Cabaña', etc.
    TipoAlojamiento NVARCHAR(50) NOT NULL, -- 'entire', 'room', 'shared'
    Metraje DECIMAL(8, 2) NULL, -- CAMBIO: Ahora permite NULL
    NumHabitaciones INT NOT NULL CONSTRAINT DF_Propiedades_NumHabitaciones DEFAULT 1,
    NumBanos INT NOT NULL CONSTRAINT DF_Propiedades_NumBanos DEFAULT 1,
    NumHuespedes INT NULL, -- NUEVA COLUMNA
    NumCamas INT NULL, -- NUEVA COLUMNA
    Distrito NVARCHAR(100) NOT NULL,
    Provincia NVARCHAR(100) NULL, -- NUEVA COLUMNA (Para 'Departamento/estado/provincia/región')
    DireccionCompleta NVARCHAR(512) NOT NULL, -- Incluye Calle, Número, Depto, etc.
    CodigoPostal NVARCHAR(10) NULL,
    MostrarUbicacionExacta BIT NULL CONSTRAINT DF_Propiedades_MostrarUbicacionExacta DEFAULT 0, -- NUEVA COLUMNA
    PrecioSugerido DECIMAL(10, 2) NULL, -- Precio calculado por el estimador
    PrecioPublicado DECIMAL(10, 2) NULL, -- Precio que el usuario decide
    FechaRegistro DATETIME2(3) NOT NULL CONSTRAINT DF_Propiedades_FechaRegistro DEFAULT GETDATE(),
    EstadoPropiedad NVARCHAR(20) NOT NULL CONSTRAINT DF_Propiedades_EstadoPropiedad DEFAULT 'EnRevision', -- 'EnRevision', 'Activa', 'Inactiva', 'Alquilada'

    CONSTRAINT PK_Propiedades PRIMARY KEY CLUSTERED (PropiedadID),
    CONSTRAINT FK_Propiedades_UsuarioID FOREIGN KEY (UsuarioID)
        REFERENCES dbo.Usuarios(UsuarioID) ON DELETE NO ACTION, -- No borrar usuario si tiene propiedades
    CONSTRAINT CK_Propiedades_Metraje CHECK (Metraje IS NULL OR Metraje > 0), -- CAMBIO: Modificado para permitir NULL
    CONSTRAINT CK_Propiedades_NumHabitaciones CHECK (NumHabitaciones >= 0),
    CONSTRAINT CK_Propiedades_NumBanos CHECK (NumBanos >= 1),
    CONSTRAINT CK_Propiedades_NumHuespedes CHECK (NumHuespedes IS NULL OR NumHuespedes >= 1), -- Constraint para nueva columna
    CONSTRAINT CK_Propiedades_NumCamas CHECK (NumCamas IS NULL OR NumCamas >= 1) -- Constraint para nueva columna
);
GO

-- Índices para optimizar filtros comunes
CREATE NONCLUSTERED INDEX IX_Propiedades_UsuarioID ON dbo.Propiedades(UsuarioID);
CREATE NONCLUSTERED INDEX IX_Propiedades_Distrito ON dbo.Propiedades(Distrito);
CREATE NONCLUSTERED INDEX IX_Propiedades_TipoPropiedad ON dbo.Propiedades(TipoPropiedad);
-- NUEVOS ÍNDICES
CREATE NONCLUSTERED INDEX IX_Propiedades_Provincia ON dbo.Propiedades(Provincia) WHERE Provincia IS NOT NULL;
CREATE NONCLUSTERED INDEX IX_Propiedades_NumHuespedes ON dbo.Propiedades(NumHuespedes) WHERE NumHuespedes IS NOT NULL;
GO

-- --- Tablas Maestras (Lookup) para atributos de Propiedad ---

-- Tabla de Comodidades (Amenities) - Asegúrate de añadir las nuevas de las imágenes
CREATE TABLE dbo.Comodidades (
    ComodidadID INT IDENTITY(1,1) NOT NULL,
    Nombre NVARCHAR(100) NOT NULL,
    Icono NVARCHAR(50) NULL, -- Para UI
    CONSTRAINT PK_Comodidades PRIMARY KEY CLUSTERED (ComodidadID),
    CONSTRAINT UQ_Comodidades_Nombre UNIQUE NONCLUSTERED (Nombre)
);
GO

-- Tabla de Destacados (Highlights) - Asegúrate de añadir las nuevas de las imágenes
CREATE TABLE dbo.Destacados (
    DestacadoID INT IDENTITY(1,1) NOT NULL,
    Nombre NVARCHAR(100) NOT NULL,
    Icono NVARCHAR(50) NULL,
    CONSTRAINT PK_Destacados PRIMARY KEY CLUSTERED (DestacadoID),
    CONSTRAINT UQ_Destacados_Nombre UNIQUE NONCLUSTERED (Nombre)
);
GO

-- Tabla de Tipos de Seguridad - Asegúrate de añadir las nuevas de las imágenes
CREATE TABLE dbo.SeguridadTipos (
    SeguridadTipoID INT IDENTITY(1,1) NOT NULL,
    Nombre NVARCHAR(100) NOT NULL,
    Icono NVARCHAR(50) NULL,
    CONSTRAINT PK_SeguridadTipos PRIMARY KEY CLUSTERED (SeguridadTipoID),
    CONSTRAINT UQ_SeguridadTipos_Nombre UNIQUE NONCLUSTERED (Nombre)
);
GO

-- Tabla de Aspectos (Aspects) - Asegúrate de añadir las nuevas de las imágenes
CREATE TABLE dbo.Aspectos (
    AspectoID INT IDENTITY(1,1) NOT NULL,
    Nombre NVARCHAR(100) NOT NULL,
    CONSTRAINT PK_Aspectos PRIMARY KEY CLUSTERED (AspectoID),
    CONSTRAINT UQ_Aspectos_Nombre UNIQUE NONCLUSTERED (Nombre)
);
GO


-- --- Tablas de Unión (Junction) para relaciones N:N de Propiedad ---

CREATE TABLE dbo.PropiedadComodidades (
    PropiedadID INT NOT NULL,
    ComodidadID INT NOT NULL,
    CONSTRAINT PK_PropiedadComodidades PRIMARY KEY CLUSTERED (PropiedadID, ComodidadID),
    CONSTRAINT FK_PropiedadComodidades_PropiedadID FOREIGN KEY (PropiedadID)
        REFERENCES dbo.Propiedades(PropiedadID) ON DELETE CASCADE,
    CONSTRAINT FK_PropiedadComodidades_ComodidadID FOREIGN KEY (ComodidadID)
        REFERENCES dbo.Comodidades(ComodidadID) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.PropiedadDestacados (
    PropiedadID INT NOT NULL,
    DestacadoID INT NOT NULL,
    CONSTRAINT PK_PropiedadDestacados PRIMARY KEY CLUSTERED (PropiedadID, DestacadoID),
    CONSTRAINT FK_PropiedadDestacados_PropiedadID FOREIGN KEY (PropiedadID)
        REFERENCES dbo.Propiedades(PropiedadID) ON DELETE CASCADE,
    CONSTRAINT FK_PropiedadDestacados_DestacadoID FOREIGN KEY (DestacadoID)
        REFERENCES dbo.Destacados(DestacadoID) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.PropiedadSeguridad (
    PropiedadID INT NOT NULL,
    SeguridadTipoID INT NOT NULL,
    CONSTRAINT PK_PropiedadSeguridad PRIMARY KEY CLUSTERED (PropiedadID, SeguridadTipoID),
    CONSTRAINT FK_PropiedadSeguridad_PropiedadID FOREIGN KEY (PropiedadID)
        REFERENCES dbo.Propiedades(PropiedadID) ON DELETE CASCADE,
    CONSTRAINT FK_PropiedadSeguridad_SeguridadTipoID FOREIGN KEY (SeguridadTipoID)
        REFERENCES dbo.SeguridadTipos(SeguridadTipoID) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.PropiedadAspectos (
    PropiedadID INT NOT NULL,
    AspectoID INT NOT NULL,
    CONSTRAINT PK_PropiedadAspectos PRIMARY KEY CLUSTERED (PropiedadID, AspectoID),
    CONSTRAINT FK_PropiedadAspectos_PropiedadID FOREIGN KEY (PropiedadID)
        REFERENCES dbo.Propiedades(PropiedadID) ON DELETE CASCADE,
    CONSTRAINT FK_PropiedadAspectos_AspectoID FOREIGN KEY (AspectoID)
        REFERENCES dbo.Aspectos(AspectoID) ON DELETE CASCADE
);
GO


-- ============================================================================
-- SECCIÓN 3: COMUNIDAD Y COMUNICACIÓN
-- ============================================================================

-- Tabla de Intereses de la Comunidad (para filtros)
CREATE TABLE dbo.Intereses (
    InteresID INT IDENTITY(1,1) NOT NULL,
    Nombre NVARCHAR(100) NOT NULL,
    Icono NVARCHAR(50) NULL,
    CONSTRAINT PK_Intereses PRIMARY KEY CLUSTERED (InteresID),
    CONSTRAINT UQ_Intereses_Nombre UNIQUE NONCLUSTERED (Nombre)
);
GO

-- Tabla de unión Usuario-Intereses
CREATE TABLE dbo.UsuarioIntereses (
    UsuarioID INT NOT NULL,
    InteresID INT NOT NULL,
    CONSTRAINT PK_UsuarioIntereses PRIMARY KEY CLUSTERED (UsuarioID, InteresID),
    CONSTRAINT FK_UsuarioIntereses_UsuarioID FOREIGN KEY (UsuarioID)
        REFERENCES dbo.Usuarios(UsuarioID) ON DELETE CASCADE,
    CONSTRAINT FK_UsuarioIntereses_InteresID FOREIGN KEY (InteresID)
        REFERENCES dbo.Intereses(InteresID) ON DELETE CASCADE
);
GO

-- Tabla de Mensajes Privados entre usuarios
CREATE TABLE dbo.MensajesPrivados (
    MensajeID INT IDENTITY(1,1) NOT NULL,
    RemitenteID INT NOT NULL,
    DestinatarioID INT NOT NULL,
    Contenido NVARCHAR(2000) NOT NULL,
    FechaEnvio DATETIME2(3) NOT NULL CONSTRAINT DF_MensajesPrivados_FechaEnvio DEFAULT GETDATE(),
    Leido BIT NOT NULL CONSTRAINT DF_MensajesPrivados_Leido DEFAULT 0,
    FechaLectura DATETIME2(3) NULL,

    CONSTRAINT PK_MensajesPrivados PRIMARY KEY CLUSTERED (MensajeID),
    CONSTRAINT FK_MensajesPrivados_RemitenteID FOREIGN KEY (RemitenteID)
        REFERENCES dbo.Usuarios(UsuarioID) ON DELETE NO ACTION, -- No borrar usuario si envió msg
    CONSTRAINT FK_MensajesPrivados_DestinatarioID FOREIGN KEY (DestinatarioID)
        REFERENCES dbo.Usuarios(UsuarioID) ON DELETE NO ACTION  -- No borrar usuario si recibió msg
);
GO

-- Índices para optimizar la carga de chats
CREATE NONCLUSTERED INDEX IX_MensajesPrivados_RemitenteID ON dbo.MensajesPrivados(RemitenteID) INCLUDE (DestinatarioID, FechaEnvio);
CREATE NONCLUSTERED INDEX IX_MensajesPrivados_DestinatarioID ON dbo.MensajesPrivados(DestinatarioID) INCLUDE (RemitenteID, FechaEnvio, Leido);
GO


-- ============================================================================
-- SECCIÓN 4: FINANZAS, REPORTES Y OCUPACIÓN
-- ============================================================================

-- Tabla de Reservas (implícita por "Tasa de Ocupación" y "Reportes")
CREATE TABLE dbo.Reservas (
    ReservaID INT IDENTITY(1,1) NOT NULL,
    PropiedadID INT NOT NULL,
    FechaInicio DATE NOT NULL,
    FechaFin DATE NOT NULL,
    MontoTotalIngreso DECIMAL(10, 2) NOT NULL,
    EstadoReserva NVARCHAR(20) NOT NULL, -- 'Confirmada', 'Pendiente', 'Cancelada'

    CONSTRAINT PK_Reservas PRIMARY KEY CLUSTERED (ReservaID),
    CONSTRAINT FK_Reservas_PropiedadID FOREIGN KEY (PropiedadID)
        REFERENCES dbo.Propiedades(PropiedadID) ON DELETE CASCADE,
    CONSTRAINT CK_Reservas_Fechas CHECK (FechaFin >= FechaInicio)
);
GO

CREATE NONCLUSTERED INDEX IX_Reservas_PropiedadID ON dbo.Reservas(PropiedadID) INCLUDE (FechaInicio, FechaFin);
GO

-- Tabla para Ingresos y Gastos (implícita por "Reporte Financiero")
CREATE TABLE dbo.Transacciones (
    TransaccionID INT IDENTITY(1,1) NOT NULL,
    PropiedadID INT NOT NULL,
    ReservaID INT NULL, -- Opcional, si es un ingreso por reserva
    TipoTransaccion NVARCHAR(10) NOT NULL, -- 'Ingreso', 'Gasto'
    Descripcion NVARCHAR(500) NOT NULL,
    Monto DECIMAL(10, 2) NOT NULL,
    FechaTransaccion DATE NOT NULL,

    CONSTRAINT PK_Transacciones PRIMARY KEY CLUSTERED (TransaccionID),
    CONSTRAINT FK_Transacciones_PropiedadID FOREIGN KEY (PropiedadID)
        REFERENCES dbo.Propiedades(PropiedadID) ON DELETE CASCADE,
    CONSTRAINT FK_Transacciones_ReservaID FOREIGN KEY (ReservaID)
        REFERENCES dbo.Reservas(ReservaID) ON DELETE NO ACTION,
    CONSTRAINT CK_Transacciones_TipoTransaccion CHECK (TipoTransaccion IN ('Ingreso', 'Gasto')),
    CONSTRAINT CK_Transacciones_Monto CHECK (Monto > 0) -- El tipo define si suma o resta
);
GO

CREATE NONCLUSTERED INDEX IX_Transacciones_PropiedadID ON dbo.Transacciones(PropiedadID) INCLUDE (FechaTransaccion, TipoTransaccion, Monto);
GO

-- Tabla de Reportes Generados
CREATE TABLE dbo.Reportes (
    ReporteID INT IDENTITY(1,1) NOT NULL,
    UsuarioID INT NOT NULL,
    PropiedadID INT NOT NULL,
    Mes INT NOT NULL,
    Anio INT NOT NULL,
    FechaGeneracion DATETIME2(3) NOT NULL CONSTRAINT DF_Reportes_FechaGeneracion DEFAULT GETDATE(),
    NombreArchivo NVARCHAR(255) NOT NULL,
    RutaAlmacenamiento NVARCHAR(512) NOT NULL,

    CONSTRAINT PK_Reportes PRIMARY KEY CLUSTERED (ReporteID),
    CONSTRAINT FK_Reportes_UsuarioID FOREIGN KEY (UsuarioID)
        REFERENCES dbo.Usuarios(UsuarioID) ON DELETE NO ACTION,
    CONSTRAINT FK_Reportes_PropiedadID FOREIGN KEY (PropiedadID)
        REFERENCES dbo.Propiedades(PropiedadID) ON DELETE NO ACTION,
    CONSTRAINT CK_Reportes_Mes CHECK (Mes BETWEEN 1 AND 12)
);
GO

CREATE NONCLUSTERED INDEX IX_Reportes_UsuarioID ON dbo.Reportes(UsuarioID) INCLUDE (FechaGeneracion);
CREATE NONCLUSTERED INDEX IX_Reportes_PropiedadID ON dbo.Reportes(PropiedadID) INCLUDE (Mes, Anio);
GO

-- Tabla Maestra de Tipos de Contenido para Reportes
CREATE TABLE dbo.ReporteTiposContenido (
    TipoContenidoID INT IDENTITY(1,1) NOT NULL,
    Nombre NVARCHAR(100) NOT NULL, -- 'Resumen Financiero', 'Estado de Ocupación', 'Regulaciones', 'Mantenimiento'
    CONSTRAINT PK_ReporteTiposContenido PRIMARY KEY CLUSTERED (TipoContenidoID),
    CONSTRAINT UQ_ReporteTiposContenido_Nombre UNIQUE NONCLUSTERED (Nombre)
);
GO

-- Tabla de unión Reporte-Contenidos
CREATE TABLE dbo.ReporteContenidos (
    ReporteID INT NOT NULL,
    TipoContenidoID INT NOT NULL,
    CONSTRAINT PK_ReporteContenidos PRIMARY KEY CLUSTERED (ReporteID, TipoContenidoID),
    CONSTRAINT FK_ReporteContenidos_ReporteID FOREIGN KEY (ReporteID)
        REFERENCES dbo.Reportes(ReporteID) ON DELETE CASCADE,
    CONSTRAINT FK_ReporteContenidos_TipoContenidoID FOREIGN KEY (TipoContenidoID)
        REFERENCES dbo.ReporteTiposContenido(TipoContenidoID) ON DELETE CASCADE
);
GO

-- ============================================================================
-- SECCIÓN 5: NOTIFICACIONES Y DATOS DE MERCADO
-- ============================================================================

-- Tabla de Notificaciones del sistema y de usuarios
CREATE TABLE dbo.Notificaciones (
    NotificacionID INT IDENTITY(1,1) NOT NULL,
    UsuarioID INT NOT NULL, -- El usuario que recibe la notificación
    TipoNotificacion NVARCHAR(20) NOT NULL, -- 'Alerta', 'Mensaje', 'Info', 'Oportunidad'
    Titulo NVARCHAR(255) NOT NULL,
    Mensaje NVARCHAR(1000) NOT NULL,
    EnlaceURL NVARCHAR(512) NULL, -- Para redirigir al usuario
    Leido BIT NOT NULL CONSTRAINT DF_Notificaciones_Leido DEFAULT 0,
    FechaCreacion DATETIME2(3) NOT NULL CONSTRAINT DF_Notificaciones_FechaCreacion DEFAULT GETDATE(),

    CONSTRAINT PK_Notificaciones PRIMARY KEY CLUSTERED (NotificacionID),
    CONSTRAINT FK_Notificaciones_UsuarioID FOREIGN KEY (UsuarioID)
        REFERENCES dbo.Usuarios(UsuarioID) ON DELETE CASCADE
);
GO

CREATE NONCLUSTERED INDEX IX_Notificaciones_UsuarioID ON dbo.Notificaciones(UsuarioID) INCLUDE (FechaCreacion, Leido);
GO

-- Tabla de Alertas de Mercado (para el popup de Notificaciones)
CREATE TABLE dbo.AlertasMercado (
    AlertaMercadoID INT IDENTITY(1,1) NOT NULL,
    Distrito NVARCHAR(100) NOT NULL,
    Titulo NVARCHAR(255) NOT NULL,
    Descripcion NVARCHAR(1000) NOT NULL,
    FechaInicio DATE NOT NULL,
    FechaFin DATE NOT NULL,

    CONSTRAINT PK_AlertasMercado PRIMARY KEY CLUSTERED (AlertaMercadoID),
    CONSTRAINT CK_AlertasMercado_Fechas CHECK (FechaFin >= FechaInicio)
);
GO

CREATE NONCLUSTERED INDEX IX_AlertasMercado_Distrito_Fechas ON dbo.AlertasMercado(Distrito, FechaInicio, FechaFin);
GO

-- Tabla de Precios de Mercado (para el Estimador)
CREATE TABLE dbo.PreciosMercado (
    PrecioMercadoID INT IDENTITY(1,1) NOT NULL,
    Distrito NVARCHAR(100) NOT NULL,
    TipoPropiedad NVARCHAR(50) NOT NULL,
    NumHabitaciones INT NOT NULL,
    PrecioPromedio DECIMAL(10, 2) NOT NULL,
    PrecioPremium DECIMAL(10, 2) NOT NULL,
    FechaActualizacion DATE NOT NULL,

    CONSTRAINT PK_PreciosMercado PRIMARY KEY CLUSTERED (PrecioMercadoID),
    CONSTRAINT UQ_PreciosMercado_Filtro UNIQUE NONCLUSTERED (Distrito, TipoPropiedad, NumHabitaciones)
);
GO

-- ============================================================================
-- SECCIÓN 6: TIPOS PERSONALIZADOS (User-Defined Types) - NUEVO
-- ============================================================================

-- Crear User-Defined Table Type para TVP (usado para inserciones múltiples)
IF TYPE_ID(N'dbo.StringList') IS NULL
BEGIN
    EXEC('CREATE TYPE dbo.StringList AS TABLE (Nombre NVARCHAR(100))');
END
GO


-- ============================================================================
-- SECCIÓN 7: POBLADO DE DATOS MAESTROS INICIALES - ACTUALIZADO
-- ============================================================================
-- Es crucial añadir aquí TODAS las opciones nuevas de las imágenes

-- Insertar comodidades básicas Y NUEVAS
-- (Añadir aquí: 'TV', 'Cocina', 'Lavadora', 'Estacionamiento gratuito', 'Estacionamiento de pago', 'Zona de trabajo')
INSERT INTO dbo.Comodidades (Nombre) VALUES
('WiFi'), ('Estacionamiento'), ('Aire Acondicionado'), ('Amoblado'),
('Cocina Equipada'), ('Lavadora'), ('Televisor'), ('Gimnasio'),
-- NUEVAS de imagen 2:
('TV'), ('Cocina'), ('Estacionamiento gratuito'), ('Estacionamiento de pago'), ('Zona de trabajo')
ON CONFLICT (Nombre) DO NOTHING; -- Opcional: Evita error si ya existen
GO

-- Insertar destacados básicos Y NUEVOS
-- (Añadir aquí: 'Jacuzzi', 'Parrilla', 'Zona de comida al aire libre', 'Lugar para hacer fogata', 'Mesa de billar', 'Chimenea interior', 'Piano', 'Equipo para hacer ejercicio', 'Acceso al lago', 'Acceso a la playa', 'Acceso a pistas de esquí', 'Ducha exterior')
INSERT INTO dbo.Destacados (Nombre) VALUES
('Vistas Panorámicas'), ('Piscina'), ('Jardín'), ('Terraza'),
-- NUEVAS de imagen 2:
('Jacuzzi'), ('Parrilla'), ('Zona de comida al aire libre'), ('Lugar para hacer fogata'),
('Mesa de billar'), ('Chimenea interior'), ('Piano'), ('Equipo para hacer ejercicio'),
('Acceso al lago'), ('Acceso a la playa'), ('Acceso a pistas de esquí'), ('Ducha exterior')
ON CONFLICT (Nombre) DO NOTHING;
GO

-- Insertar tipos de seguridad Y NUEVOS
-- (Añadir aquí: 'Detector de humo', 'Botiquín de primeros auxilios', 'Extintor de incendios', 'Detector de monóxido de carbono')
INSERT INTO dbo.SeguridadTipos (Nombre) VALUES
('Cerradura Segura'), ('Sistema de Alarma'), ('Cámaras de Seguridad'), ('Vigilancia 24/7'),
-- NUEVAS de imagen 2:
('Detector de humo'), ('Botiquín de primeros auxilios'), ('Extintor de incendios'), ('Detector de monóxido de carbono')
ON CONFLICT (Nombre) DO NOTHING;
GO

-- Insertar aspectos Y NUEVOS
-- (Añadir aquí: 'Tranquilo', 'Excepcional', 'Ideal para familias', 'Elegante', 'Central')
INSERT INTO dbo.Aspectos (Nombre) VALUES
('Tamaño Espacioso'), ('Mucha Luz Natural'), ('Zona Tranquila'), ('Ubicación Céntrica'),
-- NUEVAS de imagen 3:
('Tranquilo'), ('Excepcional'), ('Ideal para familias'), ('Elegante'), ('Central')
ON CONFLICT (Nombre) DO NOTHING;
GO

-- Insertar intereses de comunidad (sin cambios)
INSERT INTO dbo.Intereses (Nombre, Icono) VALUES
('Mantenimiento', '🔧'), ('Legal', '⚖️'), ('Optimización', '📊'),
('Marketing', '📱'), ('Finanzas', '💰'), ('Seguridad', '🔒')
ON CONFLICT (Nombre) DO NOTHING;
GO

-- Insertar tipos de contenido de reporte (sin cambios)
INSERT INTO dbo.ReporteTiposContenido (Nombre) VALUES
('Resumen Financiero'), ('Estado de Ocupación'), ('Actualizaciones de Regulaciones'), ('Historial de Mantenimiento')
ON CONFLICT (Nombre) DO NOTHING;
GO

PRINT 'Esquema de PrediRentDB actualizado y datos maestros poblados exitosamente.';
