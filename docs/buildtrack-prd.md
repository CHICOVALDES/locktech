# BuildTrack — Product Requirements Document (PRD)

> Nueva sección de la plataforma: **Construction Intelligence Platform** para monitorear obras
> (villas/casas) en Bali de forma remota. Se integra en la app actual (Bali Moto Track) reutilizando
> auth por roles, feed de cámara y el motor de timelapse ya existentes.

## Project overview

BuildTrack es una plataforma cloud para que developers, contratistas, inversores, project managers y
dueños de villas monitoreen obras en tiempo real. Combina: cámaras inteligentes, generación de
timelapse, seguimiento de avance, reportes, documentación de proyecto, colaboración de equipo y (a
futuro) analítica de obra con IA.

## Primary users

- **Investor** — monitorea avance remoto: imágenes en vivo, reportes de avance, timelapses, updates.
- **Developer** — visibilidad multi-proyecto: dashboard multi-proyecto, gestión de equipo, reportes, docs.
- **Contractor** — transparencia con el cliente: subir notas, trackear hitos, compartir avance.
- **Administrator** — administra la plataforma: usuarios, cámaras, proyectos, facturación.

## MVP features

### 1. Authentication
Roles: Super Admin, Admin, Investor, Developer, Contractor, Project Manager.
Features: Email login, Google login, password reset, permisos por usuario.

### 2. Project management
Cada proyecto: Nombre, Dirección, Coordenadas GPS, Fecha inicio, Fecha estimada de fin, Cliente,
Descripción, Estado (Planning / Active / Delayed / Completed), Usuarios asignados, Cámaras asignadas.

### 3. Camera management
Cada cámara: Camera ID, Project ID, Ubicación, % batería, Señal, Estado online, Última subida,
Frecuencia de imagen, Estado (Online / Offline / Maintenance).

### 4. Image storage system
Subida automática. Guardar: Image ID, Project ID, Camera ID, Fecha, Hora, URL, Metadata.
Features: galería, búsqueda por fecha, descarga, vista full screen.

### 5. Live dashboard (por proyecto)
Imagen actual, Estado, % avance, Días transcurridos, Días restantes, Estado de cámara, Batería,
Señal, Actividad reciente, Último timelapse, Último reporte.

### 6. Timelapse engine
Diario / Semanal / Mensual / Rango custom. Formatos: MP4, HD, vertical para redes.
Features: descarga, compartir, auto-generación.

### 7. Reporting system
Reportes automáticos: Semanal / Mensual / Custom. Incluye: info del proyecto, resumen de avance,
imágenes, preview de timelapse, hitos, comentarios, estado. Export: PDF, Excel.

### 8. Project timeline (milestones)
Site Preparation, Excavation, Foundation, Structure, Roofing, MEP Installation, Finishing,
Landscaping, Completion. Estado por hito: Not Started / In Progress / Completed / Delayed.

### 9. Document management
Contratos, planos arquitectónicos, permisos, facturas, planos de ingeniería, fotos, certificados.
Features: upload, download, control de versiones, estructura de carpetas, búsqueda.

### 10. Notifications
Disparadores: cámara offline, batería baja, sin imágenes, nuevo reporte, hito completado, proyecto
demorado. Canales: Email, WhatsApp, Push.

### 11. Mobile application
Android primero. Features: dashboard, galería, timelapse viewer, reportes, notificaciones, info de
proyecto, documentos.

## Multi-project dashboard
Ver todos los proyectos, estado, % avance, días restantes, última imagen, alertas, búsqueda y filtros.

## Phase 2 features
Financial tracking, budget, pagos, facturas, gestión de contratistas, gestión de tareas, issue
tracking, subidas de drone, inspecciones de sitio, checklists.

## Phase 3 — AI features
Detección de avance de obra, reconocimiento de hitos, predicción de demoras, estimación de % avance,
resumen semanal con IA, detección de riesgo, project health score.

## Technical stack (del PRD original)
- Frontend: Next.js — **(la app actual usa React + Vite; ver decisión de integración)**
- Backend: Node.js — **(la app actual usa Fastify; se reutiliza)**
- Database: PostgreSQL
- Storage: AWS S3 o Cloudflare R2
- Auth: Firebase Auth
- Hosting: AWS / DigitalOcean — **(la app actual está en Render)**
- Notifications: WhatsApp API + Firebase Push
- Video: FFmpeg — **(ya integrado vía imageio-ffmpeg en el timelapse actual)**
- Mobile: React Native

## Design style
SaaS moderno inspirado en Procore, Autodesk Construction Cloud, Monday.com, Linear, Stripe Dashboard.
Tema: Dark Navy, Construction Gold, White. Profesional, premium, simple, rápido, mobile first.

## Company vision
BuildTrack será la plataforma líder de Construction Intelligence en el Sudeste Asiático, permitiendo a
inversores, developers y contratistas monitorear, documentar y gestionar obras desde cualquier lugar.

---

## Notas de implementación (reconciliación con la base actual)

La app actual (`bali-moto-track`) ya aporta piezas reutilizables para el MVP:
- **Auth por roles** (`apps/web/src/features/auth`) — extender roles a los de BuildTrack.
- **Motor de timelapse server-side** (`apps/api/src/capture/timelapse.ts`) — yt-dlp/RTSP → ffmpeg → manifest.
- **Feed de cámara** (`apps/web/src/features/cameras`) — base para el visor por proyecto.
- **Gateways WS y stores in-memory** — patrón para estado en vivo.

Gap principal a decidir: **persistencia real** (proyectos/imágenes/reportes) — hoy todo es
in-memory/localStorage.
