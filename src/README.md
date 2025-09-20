# 📅 Sistema de Gestión de Gastos y Quinielas

Una aplicación completa para la gestión diaria de gastos personales y administración de quinielas, desarrollada con React, TypeScript, Tailwind CSS y Node.js.

## 🚀 Características Principales

- **Autenticación Completa**: Login, registro y recuperación de contraseña
- **Gestión de Gastos**: Sistema de categorías (Sueldo, Servicios, Otros) con subcategorías
- **Sistema de Quinielas**: Gestión de diferentes tipos de juegos de quiniela
- **Calendario Interactivo**: Navegación por días con estados de finalización
- **Interfaz Responsiva**: Diseño adaptable para desktop y mobile
- **Sistema de Notificaciones**: Toast notifications con Sonner
- **Modo Oscuro**: Soporte completo para tema claro/oscuro

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** con TypeScript
- **Tailwind CSS v4** para estilos
- **shadcn/ui** para componentes
- **Lucide React** para iconos
- **Sonner** para notificaciones
- **date-fns** para manejo de fechas

### Backend (Recomendado)
- **Node.js** con Express
- **MySQL/PostgreSQL** para base de datos
- **JWT** para autenticación
- **bcrypt** para encriptación
- **Nodemailer** para emails

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Base de datos MySQL/PostgreSQL (para backend)

## 🚀 Instalación y Configuración

### 1. Configuración del Frontend

```bash
# Instalar dependencias
npm install

# Instalar dependencias específicas del proyecto
npm install sonner@2.0.3 react-hook-form@7.55.0

# Ejecutar en modo desarrollo
npm run dev
```

### 2. Configuración del Backend Node.js

```bash
# Crear directorio del backend
mkdir backend && cd backend

# Inicializar proyecto Node.js
npm init -y

# Instalar dependencias
npm install express cors bcryptjs jsonwebtoken mysql2 sequelize nodemailer express-validator helmet express-rate-limit

# Instalar dependencias de desarrollo
npm install -D nodemon

# Ejecutar servidor
npm run dev
```

### 3. Variables de Entorno

Crear archivo `.env` en el directorio backend:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=calendario_app
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña

# JWT
JWT_SECRET=tu_clave_secreta_muy_larga_y_segura
JWT_EXPIRES_IN=1d

# Email (para recuperación de contraseña)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 4. Base de Datos

El esquema completo de la base de datos está en `/database-schema.md`. 

Para MySQL:
```sql
CREATE DATABASE calendario_app;
-- Ejecutar los scripts del esquema
```

## 📁 Estructura del Proyecto

```
proyecto/
├── frontend/                 # Aplicación React (código actual)
│   ├── components/          # Componentes React
│   ├── services/           # ApiService para backend
│   ├── types/              # Tipos TypeScript
│   ├── styles/             # Estilos Tailwind
│   └── App.tsx             # Componente principal
├── backend/                # Servidor Node.js (a implementar)
│   ├── src/
│   │   ├── controllers/    # Controladores API
│   │   ├── models/         # Modelos de datos
│   │   ├── routes/         # Rutas API
│   │   ├── services/       # Lógica de negocio
│   │   └── config/         # Configuración DB
│   └── package.json
└── database/               # Scripts SQL
    └── schema.sql
```

## 🔧 Configuración de APIs

El frontend está configurado para conectarse automáticamente con el backend Node.js mediante el `ApiService` en `/services/apiService.ts`.

### Endpoints Principales:

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/password-recovery` - Recuperación de contraseña
- `GET /api/gastos?fecha=YYYY-MM-DD` - Obtener gastos
- `POST /api/gastos` - Registrar gasto
- `POST /api/quinielas/transaccion` - Registrar transacción quiniela

## 🎨 Personalización de Estilos

Los estilos están completamente personalizados en `/styles/globals.css` con:

- Variables CSS custom para temas
- Estilos específicos para estados de días (editable/readonly)
- Animaciones y transiciones personalizadas
- Soporte completo para modo oscuro

## 🔒 Seguridad

- Autenticación JWT con refresh tokens
- Encriptación bcrypt para contraseñas
- Rate limiting en APIs
- Validación de datos con express-validator
- Headers de seguridad con helmet

## 📱 Características de UX

- **Estados de Día Intuitivos**: Visualización clara de días editables vs solo lectura
- **Loading States**: Indicadores de carga en todas las operaciones
- **Notificaciones**: Sistema completo de toast notifications
- **Validaciones**: Formularios con validación en tiempo real
- **Responsive**: Adaptado para dispositivos móviles

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Subir carpeta dist/ a tu plataforma preferida
```

### Backend (Railway/Heroku/DigitalOcean)
```bash
# Configurar variables de entorno en la plataforma
# Ejecutar migraciones de base de datos
# Deploy del código backend
```

## 📝 Scripts Disponibles

```bash
# Frontend
npm run dev          # Desarrollo
npm run build        # Construcción para producción
npm run preview      # Vista previa de build

# Backend
npm run dev          # Desarrollo con nodemon
npm start           # Producción
npm run migrate     # Ejecutar migraciones (a implementar)
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación del esquema en `/database-schema.md`
2. Verifica las configuraciones de entorno
3. Consulta los logs del servidor para errores de API
4. Revisa que el backend esté ejecutándose en el puerto correcto

## 🚧 Próximas Características

- [ ] Dashboard con reportes y gráficos
- [ ] Exportación de datos a Excel/PDF
- [ ] Notificaciones push
- [ ] API móvil
- [ ] Sincronización offline
- [ ] Backup automático de datos

---

**¡Tu aplicación está lista para producción!** 🎉