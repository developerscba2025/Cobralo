# Cobralo App 🚀

**Cobralo** es la plataforma definitiva para la gestión de alumnos y cobros, diseñada específicamente para gimnasios, academias y profesores particulares. 

## 🛠️ Stack Tecnológico

- **Frontend**: React + Vite + TailwindCSS + Framer Motion
- **Backend**: Node.js + Express + Prisma ORM
- **Base de Datos**: PostgreSQL (Soportado en Railway/Neon)
- **Email**: Resend (Notificaciones y recuperación de cuenta)
- **Pagos**: Mercado Pago SDK (Integración nativa)

## 📦 Estructura del Proyecto

El proyecto utiliza **NPM Workspaces** para gestionar ambos entornos desde la raíz:

- `/frontend`: Aplicación cliente (PWA lista para producción).
- `/backend`: Servidor API y lógica de negocio.

## 🚀 Despliegue en Producción

### 1. Variables de Entorno
Configura las siguientes variables en tu servidor (Railway, Render, o VPS):

- `DATABASE_URL`: URL de conexión a PostgreSQL.
- `JWT_SECRET`: Llave secreta para sesiones seguras.
- `MERCADO_PAGO_ACCESS_TOKEN`: Token de producción de Mercado Pago.
- `RESEND_API_KEY`: Api Key para envío de emails.
- `FRONTEND_URL`: URL donde se hospeda el frontend (ej. `https://cobralo.app`).

### 2. Comandos de Build
Desde la raíz del proyecto:

```bash
# Instalar todas las dependencias
npm install

# Construir el frontend
npm run build -w frontend

# Preparar y migrar base de datos
npx prisma migrate deploy --schema=backend/prisma/schema.prisma
```

## 📈 Planes y Suscripción

1. **Plan Básico**: 14 días de prueba con acceso total ilimitado al registrarse.
2. **Plan Pro**: Suscripción mensual con soporte para pagos vía Mercado Pago y recordatorios automáticos de WhatsApp.

---
© 2026 Cobralo App. Todos los derechos reservados.
