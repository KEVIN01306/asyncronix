# Asyncronix - Plataforma SaaS Multi-Inquilino de Gestión Operativa

¡Bienvenido a **Asyncronix**! Una plataforma de software como servicio (SaaS) multi-inquilino diseñada para la automatización y gestión integral de talleres mecánicos, control de inventario (lotes y productos), facturación, ventas, sucursales y roles de usuario.

Este repositorio es un monorepo modular que contiene tanto la aplicación frontend como el servidor backend de la plataforma.

---

## 🚀 Guía de Inicio Rápido (Entorno de Desarrollo)

Sigue estos pasos para configurar y ejecutar localmente tanto el frontend como el backend de Asyncronix.

### 📋 Requisitos Previos
Asegúrate de tener instalados los siguientes componentes en tu sistema:
*   [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
*   [npm](https://www.npmjs.com/) (instalador de paquetes de Node)
*   [MySQL](https://www.mysql.com/) (servidor de base de datos relacional)

---

### 🔧 1. Configuración del Servidor Backend (`saas-backend/`)

1.  **Navega al directorio del backend**:
    ```bash
    cd saas-backend
    ```
2.  **Instala las dependencias**:
    ```bash
    npm install
    ```
3.  **Configura las variables de entorno**:
    Crea un archivo `.env` en la raíz de `saas-backend/` basándote en la siguiente plantilla:
    ```env
    PORT=3000
    DATABASE_URL="mysql://usuario:contraseña@localhost:3306/asyncronix_db"
    JWT_SECRET="tu_clave_secreta_super_segura_para_firmar_tokens_jwt"
    ```
4.  **Ejecuta las migraciones de la base de datos** (Prisma ORM):
    Este comando sincronizará el esquema relacional con tu base de datos MySQL local:
    ```bash
    npm run db:migrate
    ```
5.  **Puebla la base de datos con datos de prueba** (Seed):
    Crea las configuraciones iniciales, módulos, permisos globales y un usuario administrador de demostración:
    ```bash
    npx prisma db seed
    ```
6.  **Inicia el servidor en modo desarrollo**:
    ```bash
    npm run dev
    ```
    El servidor backend se levantará en: `http://localhost:3000`

---

### 💻 2. Configuración del Cliente Frontend (`saas-frontend/`)

1.  **Navega al directorio del frontend**:
    ```bash
    cd ../saas-frontend
    ```
2.  **Instala las dependencias**:
    ```bash
    npm install
    ```
3.  **Configura las variables de entorno**:
    Crea un archivo `.env` en la raíz de `saas-frontend/` con la siguiente variable que apunta a la API:
    ```env
    VITE_API_URL="http://localhost:3000"
    ```
4.  **Inicia el servidor de desarrollo de Vite**:
    ```bash
    npm run dev
    ```
    El frontend estará disponible de inmediato en tu navegador web en: `http://localhost:5173`

---

## 📂 Estructura General del Espacio de Trabajo

El monorepo está dividido en dos componentes de alta cohesión y bajo acoplamiento:

*   **[`saas-backend`](file:///Applications/asyncronix/saas-backend)**: API RESTful construida con Node.js y Express. Utiliza Prisma ORM para mapear la persistencia sobre una base de datos MySQL. Implementa autenticación basada en JWT asíncronos y validación de esquemas JSON con Zod.
*   **[`saas-frontend`](file:///Applications/asyncronix/saas-frontend)**: Aplicación web de página única (SPA) desarrollada en React 19 y empaquetada con Vite. Utiliza la librería de diseño premium Material UI v7, control de rutas perezosas (lazy loading) con React Router Dom v7, y una arquitectura de estado global ultraligera con Zustand.

---

## 🛠️ Arquitectura, Patrones y Flujos de Datos

Ambos proyectos han sido diseñados meticulosamente implementando **Clean Architecture (Arquitectura Limpia)** a nivel modular. Cada dominio operativo se divide de forma simétrica en capas autocontenidas:

*   **Dominio (`domain`)**: Entidades de negocio puras y contratos abstractos.
*   **Aplicación (`application`)**: Casos de uso que ejecutan las reglas del sistema (Backend).
*   **Infraestructura (`infrastructure`)**: Persistencia mediante Prisma (Backend) e interacción de API mediante Axios (Frontend).
*   **Presentación (`presentation`)**: Controladores HTTP en backend; Componentes React, formularios y hooks reactivos en frontend.

> [!NOTE]
> Para una explicación detallada a nivel de ingeniería acerca de los patrones de diseño aplicados (Repository, Mapper, Dependency Injection, Custom Error Mapping), diagramas interactivos de flujo de datos, seguridad por roles y permisos (RBAC) y control de rutas con `<RouteProtector>`, consulta el archivo completo de:
> **[technical_documentation.md](file:///Applications/asyncronix/technical_documentation.md)**

---

## 📦 Scripts Útiles del Monorepo

### En `saas-backend/`:
*   `npm run dev`: Inicia el servidor de desarrollo utilizando `tsx` para la compilación al vuelo de TypeScript con reinicios automáticos mediante `nodemon`.
*   `npm run db:migrate`: Genera y aplica migraciones incrementales sobre la base de datos MySQL.
*   `npm run db:studio`: Abre una interfaz gráfica interactiva en el navegador para explorar y modificar los datos directamente en la base de datos.
*   `npm start`: Ejecuta el servidor en producción.

### En `saas-frontend/`:
*   `npm run dev`: Lanza el servidor de desarrollo Vite con Hot Module Replacement instantáneo.
*   `npm run build`: Compila los componentes de React, realiza el chequeo estático de TypeScript (`tsc`) y empaqueta el bundle optimizado para producción en el directorio `dist/`.
*   `npm run lint`: Ejecuta el analizador estático de código ESLint para comprobar el cumplimiento de las buenas prácticas y reglas estéticas del proyecto.
