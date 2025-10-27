-- ====================================================================
-- Script de Cambios para la Base de Datos PrediRentDB
-- ====================================================================

-- Inicio de la transacción para asegurar que todos los cambios se apliquen o ninguno.
BEGIN TRANSACTION;
GO

-- 1. Creación de un backup de la tabla de propiedades (recomendado ejecutar manualmente)
-- El timestamp debe ser reemplazado por la fecha y hora actual al ejecutar.
-- SELECT * INTO dbo.Propiedades_backup_YYYYMMDD_HHMMSS FROM dbo.Propiedades;
-- GO

-- 2. Añadir nuevas columnas a la tabla de Propiedades si no existen
PRINT 'Añadiendo nuevas columnas a dbo.Propiedades...';
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Propiedades') AND name = 'NumHuespedes')
BEGIN
    ALTER TABLE dbo.Propiedades ADD NumHuespedes INT NULL;
    PRINT '  - Columna NumHuespedes añadida.';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Propiedades') AND name = 'NumCamas')
BEGIN
    ALTER TABLE dbo.Propiedades ADD NumCamas INT NULL;
    PRINT '  - Columna NumCamas añadida.';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Propiedades') AND name = 'Provincia')
BEGIN
    ALTER TABLE dbo.Propiedades ADD Provincia NVARCHAR(100) NULL;
    PRINT '  - Columna Provincia añadida.';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Propiedades') AND name = 'MostrarUbicacionExacta')
BEGIN
    ALTER TABLE dbo.Propiedades ADD MostrarUbicacionExacta BIT NULL CONSTRAINT DF_Propiedades_MostrarUbicacionExacta DEFAULT 0;
    PRINT '  - Columna MostrarUbicacionExacta añadida.';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Propiedades') AND name = 'PrecioSugerido')
BEGIN
    ALTER TABLE dbo.Propiedades ADD PrecioSugerido DECIMAL(10, 2) NULL;
    PRINT '  - Columna PrecioSugerido añadida.';
END
GO

-- 3. Crear la tabla para almacenar las estimaciones realizadas
PRINT 'Creando tabla dbo.PropiedadEstimaciones...';
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('dbo.PropiedadEstimaciones') AND type in (N'U'))
BEGIN
    CREATE TABLE dbo.PropiedadEstimaciones (
        EstimacionID INT IDENTITY(1,1) PRIMARY KEY,
        PropiedadID INT NOT NULL,
        PrecioSugerido DECIMAL(10, 2) NOT NULL,
        ModeloVersion NVARCHAR(50) NULL,
        FechaEstimacion DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT FK_PropiedadEstimaciones_Propiedades FOREIGN KEY (PropiedadID) REFERENCES dbo.Propiedades(PropiedadID)
    );
    PRINT '  - Tabla dbo.PropiedadEstimaciones creada.';
END
GO

-- 4. Crear el User-Defined Table Type (UDT) para los TVP si no existe
PRINT 'Creando tipo de tabla dbo.StringList...';
IF NOT EXISTS (SELECT * FROM sys.table_types WHERE name = 'StringList')
BEGIN
    CREATE TYPE dbo.StringList AS TABLE (
        Nombre NVARCHAR(100) NOT NULL
    );
    PRINT '  - Tipo dbo.StringList creado.';
END
GO

-- Finalizar la transacción
COMMIT TRANSACTION;
GO

PRINT '✅ Script de migración de base de datos completado exitosamente.';
GO
