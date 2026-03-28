// Carga de variables de entorno (Puerto, DB_HOST, etc.)
require('dotenv').config();

const app = require('./src/app');
const db = require('./src/config/db');

// Definir el puerto (3000 por defecto si no está en .env)
const PORT = process.env.PORT || 3000;

/**
 * Verificación de conexión a la base de datos antes de iniciar el servidor
 * Esto asegura que no levantemos la app si XAMPP/MySQL está caído.
 */
db.query('SELECT 1', (err) => {
    if (err) {
        console.error('❌ ERROR: No se pudo conectar a MySQL en XAMPP.');
        console.error('Asegúrate de que el panel de XAMPP tenga MySQL en "Running".');
        process.exit(1); // Detiene la ejecución si no hay base de datos
    } else {
        console.log('✅ Conexión a MySQL (XAMPP) exitosa.');
        
        // Iniciar el servidor
        app.listen(PORT, () => {
            console.log(`🚀 Servidor Cobralo corriendo en: http://localhost:${PORT}`);
            console.log(`📌 Documentación de API disponible en http://localhost:${PORT}/api/students`);
        });
    }
});

// Manejo de errores globales para evitar que el servidor se caiga
process.on('unhandledRejection', (err) => {
    console.log(`Error Crítico: ${err.message}`);
    // Cerrar el servidor de forma elegante
    process.exit(1);
});