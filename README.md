# FacturaX

**FacturaX** es una plataforma gratuita y moderna para la gestión inteligente de facturas en PDF. Permite a los usuarios registrarse, iniciar sesión, subir facturas, extraer automáticamente datos clave mediante OCR y administrar toda su documentación fiscal desde un panel seguro e intuitivo.

![Landing page](https://julscatalan.dev/extra-images/facturax-landing.png)

---

## 🚀 Tecnologías

- **Frontend:** React + Vite + Tailwind CSS + React Router
- **Backend:** Node.js + Express + JWT + Supabase (PostgreSQL)
- **OCR/Parser:** `pdf-parse` para extracción automática de texto desde archivos PDF
- **Almacenamiento:** AWS S3 o almacenamiento local
- **Contenedores:** Docker para desarrollo y despliegue

---

![Dashboard page](https://julscatalan.dev/extra-images/facturax-dash.png)

## 📦 Instalación Local

### Requisitos Previos
- Node.js (v16 o superior)
- Docker (opcional, pero recomendado)
- Cuenta en Supabase
- Bucket de AWS S3 (opcional)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/facturax.git
cd facturax
```

### 2. Opción A: Instalación con Docker (Recomendado)

Asegúrate de tener Docker instalado en tu sistema y todas las variables de entorno configuradas como se muestra en `.env.example`.

```bash
# Construir la imagen
docker build -t facturax .

# Ejecutar el contenedor en el puerto 3000
docker run -p 3000:3000 --env-file .env facturax
```

### 2. Opción B: Instalación Manual

#### Instalar Dependencias
```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

#### Configurar Variables de Entorno

**Backend (`server/.env`):**
```env
PORT=3001
JWT_SECRET=your_secret_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_or_service_role_key
S3_BUCKET_NAME=your-bucket
S3_REGION=your-region
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
```

**Frontend (`client/.env`):**
```env
VITE_API_URL=http://localhost:3001
```

#### Ejecutar la Aplicación
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

La aplicación estará disponible en:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001

---

## 🔌 API Endpoints

### 🔑 Autenticación (`/auth`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/auth/register-user` | Registro de nuevo usuario |
| `POST` | `/auth/login-user` | Inicio de sesión |
| `POST` | `/auth/logout-user` | Cierre de sesión |

### 📄 Facturas (`/invoices`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/invoice/upload-invoice-s3` | Obtener URL firmada para subir PDF a S3 |
| `GET` | `/invoice/get-user-invoices` | Obtener todas las facturas del usuario |
| `POST` | `/invoice/upload` | Registrar nueva factura (con URL del PDF) |
| `DELETE` | `/invoice/delete-invoice/:id` | Eliminar factura por ID |

### 👤 Perfil de Usuario (`/user`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/user/get-user-profile` | Obtener información del perfil |
| `PUT` | `/user/update-user-profile` | Actualizar datos del perfil |

> **Nota:** Las rutas protegidas requieren incluir las credenciales de autenticación (token JWT) en los headers desde el frontend.

---

## 🛡️ Autenticación

La aplicación utiliza JWT (JSON Web Tokens) para manejar la autenticación mediante cookies httpOnly. Las credenciales se envían automáticamente desde el frontend usando:

```javascript
headers: {
  'Content-Type': 'application/json',
},
credentials: 'include'
```

El token JWT se almacena de forma segura en una cookie httpOnly que se incluye automáticamente en las peticiones cuando se usa `credentials: 'include'`.

## Carpeta Test/data

Esta carpeta es necesaria en el proyecto para que la dependencia de pdf-parser funcione correctamente ya que a falta de esta se manda un error. Esta solo contiene un pdf vacío.

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.