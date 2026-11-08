# Lector+ · Frontend

Interfaz web de **Lector+**, una biblioteca digital construida con React 19, Vite y Tailwind CSS. Consume la API de [Lector+ Backend](https://github.com/Plataforma-Lector-Api/Backend) (FastAPI + MongoDB) e incluye catálogo, búsqueda, biblioteca personal, reseñas, progreso de lectura, lector de PDFs con GridFS y panel administrativo.

## Stack

- **React 19** + **TypeScript 6** + **Vite 8**
- **Tailwind CSS 3.4** con componentes estilo shadcn/ui sobre Radix UI
- **TanStack Query 5** para estado del servidor
- **React Router 7** para rutas
- **React Hook Form + Zod** para formularios
- **Recharts** para las gráficas del dashboard
- **react-pdf 11 + pdfjs-dist 6** para leer PDFs almacenados en MongoDB GridFS
- Tipografías **Fraunces** (display) e **Inter** (UI), empaquetadas con Fontsource

## Requisitos

- Node.js 20 o superior
- npm 10 o superior
- El backend de Lector+ corriendo (local o desplegado)

## Puesta en marcha

```bash
npm install
cp .env.example .env
npm run dev
```

La app queda disponible en `http://localhost:5173`.

### Variables de entorno

| Variable       | Descripción                          | Valor por defecto                 |
| -------------- | ------------------------------------ | --------------------------------- |
| `VITE_API_URL` | URL base de la API (incluye `/api/v1`) | `http://localhost:8000/api/v1` |

Para producción en Vercel, configura `VITE_API_URL` con la URL pública del backend, por ejemplo:

```env
VITE_API_URL=https://lector-plus-api.onrender.com/api/v1
```

## Cuentas de demostración

| Rol     | Correo              | Contraseña  |
| ------- | ------------------- | ----------- |
| Admin   | `admin@lector.com`  | `Admin123!` |
| Lector  | `lector@lector.com` | `Lector123!` |

> Las cuentas y los datos de ejemplo se crean con el seed del backend:
> `.\.venv\Scripts\python.exe -m app.scripts.seed`

## Rutas principales

| Ruta                  | Descripción                                                        |
| --------------------- | ------------------------------------------------------------------ |
| `/`                   | Inicio con destacados, estadísticas y recomendaciones              |
| `/catalogo`           | Catálogo con búsqueda full-text y filtros por tipo, etiqueta, idioma y año |
| `/contenido/:id`      | Detalle: sinopsis, metadatos, reseñas, guardar y progreso          |
| `/leer/:id`           | Lector de PDF servido desde GridFS, con guardado de progreso       |
| `/biblioteca`         | Biblioteca personal: guardados, en curso y completados             |
| `/consultas`          | Las 10 consultas MongoDB ejecutables en vivo con código y tiempo   |
| `/perfil`             | Edición de datos y actividad de lectura                            |
| `/login`, `/registro` | Autenticación con JWT (access + refresh token)                     |
| `/admin`              | Dashboard con métricas y gráficas                                  |
| `/admin/contenidos`   | CRUD de contenidos y subida de PDFs a GridFS                       |
| `/admin/usuarios`     | Búsqueda, roles y estado de las cuentas                            |

## Scripts

```bash
npm run dev      # Servidor de desarrollo en el puerto 5173
npm run build    # Type-check + build de producción en dist/
npm run preview  # Previsualiza el build en el puerto 4173
npm run lint     # ESLint
```

## Estructura

```text
src/
├── components/       # Layout, UI (Radix/shadcn) y visor de PDF
├── hooks/            # Auth, catálogo, biblioteca, admin, queries
├── lib/              # Cliente HTTP, formato y utilidades
├── pages/            # Vistas de la aplicación
├── types/            # Tipos compartidos con la API
├── App.tsx           # Rutas y providers
└── main.tsx          # Punto de entrada
```

## Integración con la API

- El cliente HTTP vive en `src/lib/api.ts` y añade el `Authorization: Bearer` automáticamente.
- Si el access token expira, el cliente renueva la sesión con el refresh token y reintenta la petición.
- La sesión se persiste en `localStorage` (`lector.access_token`, `lector.refresh_token`, `lector.user`).
- Los PDFs se descargan con credenciales desde `GET /api/v1/contents/{id}/file` y se renderizan con `react-pdf`.

## Despliegue en Vercel

1. Importa este repositorio en Vercel.
2. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
3. Define `VITE_API_URL` con la URL del backend en Render.
4. `vercel.json` ya incluye el rewrite de SPA para que las rutas de React Router funcionen al recargar.

## Documentación relacionada

- API y Swagger: `https://<backend>/docs`
- ReDoc: `https://<backend>/redoc`
- Repositorio del backend: [Plataforma-Lector-Api/Backend](https://github.com/Plataforma-Lector-Api/Backend)

## Notas

- El build muestra una advertencia por el tamaño del bundle (~1.78 MB) debido a `pdfjs-dist` y `recharts`; no impide el despliegue. Se puede reducir con imports dinámicos por ruta.
- El worker de PDF se carga con `pdfjs-dist/build/pdf.worker.min.mjs?url`, por lo que Vite lo empaqueta como asset.
