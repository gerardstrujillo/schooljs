# Sistema Inteligente de Riesgo Académico (SIRA)

Sistema web completo para detección temprana del riesgo académico en estudiantes de educación secundaria.

## 🚀 Características

- **Autenticación**: Login y registro seguro con Supabase
- **Gestión de Estudiantes**: CRUD completo de estudiantes
- **Gestión de Configuración**: Grados, secciones, cursos y períodos académicos
- **Registro de Notas**: Sistema de registro y edición de calificaciones
- **Consulta de Notas**: Búsqueda y análisis de calificaciones
- **Evaluación de Riesgo**: Análisis automático del riesgo académico
- **Puntos Críticos**: Detección de situaciones importantes
- **Asistente IA**: Consultas en lenguaje natural sobre datos académicos
- **Dashboard**: Resumen ejecutivo con KPIs principales

## 📋 Requisitos

- Node.js (versión 16 o superior)
- npm o yarn
- Cuenta de Supabase

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repositorio>
cd school
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar Supabase**
   - Copiar `.env.local` a `.env.local.example`
   - Actualizar los valores de `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
   - Obtener estas credenciales desde tu proyecto de Supabase

4. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📊 Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── Auth/           # Autenticación
│   ├── Layout/         # Layout principal
│   ├── Dashboard/      # Dashboard
│   ├── Estudiantes/    # Gestión de estudiantes
│   ├── Notas/          # Registro y consulta de notas
│   ├── Grados/         # Gestión de grados
│   ├── Secciones/      # Gestión de secciones
│   ├── Cursos/         # Gestión de cursos
│   ├── Periodos/       # Gestión de períodos
│   ├── RiesgoAcademico/# Análisis de riesgo
│   ├── PuntosCriticos/ # Detección de puntos críticos
│   └── AsistenteIA/    # Consultas en lenguaje natural
├── services/           # Servicios API
│   ├── supabaseClient.js
│   ├── authService.js
│   ├── estudianteService.js
│   ├── notasService.js
│   ├── gradoService.js
│   ├── seccionService.js
│   ├── cursoService.js
│   ├── periodoService.js
│   ├── riesgoService.js
│   └── criticalPointsService.js
├── hooks/              # Hooks personalizados
│   └── useAuth.js
└── App.jsx            # Enrutador principal
```

## 🗄️ Tablas en Supabase

El sistema requiere las siguientes tablas en tu base de datos PostgreSQL:

### users
- id (UUID, PK)
- email (VARCHAR)
- nombre (VARCHAR)
- rol (VARCHAR)
- created_at (TIMESTAMP)

### grados
- id (UUID, PK)
- nombre (VARCHAR)
- nivel (INT)
- created_at (TIMESTAMP)

### secciones
- id (UUID, PK)
- nombre (VARCHAR)
- grado_id (FK -> grados)
- created_at (TIMESTAMP)

### cursos
- id (UUID, PK)
- nombre (VARCHAR)
- codigo (VARCHAR)
- created_at (TIMESTAMP)

### periodos
- id (UUID, PK)
- nombre (VARCHAR)
- numero (INT)
- año (INT)
- fecha_inicio (DATE)
- fecha_fin (DATE)
- created_at (TIMESTAMP)

### estudiantes
- id (UUID, PK)
- nombre (VARCHAR)
- apellidos (VARCHAR)
- codigo_estudiante (VARCHAR, UNIQUE)
- grado_id (FK -> grados)
- seccion_id (FK -> secciones)
- estado (VARCHAR)
- created_at (TIMESTAMP)

### notas
- id (UUID, PK)
- estudiante_id (FK -> estudiantes)
- curso_id (FK -> cursos)
- periodo_id (FK -> periodos)
- nota (NUMERIC)
- estado (VARCHAR)
- fecha_registro (TIMESTAMP)
- docente_id (FK -> users)

### evaluaciones_riesgo
- id (UUID, PK)
- estudiante_id (FK -> estudiantes)
- periodo_id (FK -> periodos)
- nivel_riesgo (VARCHAR)
- promedio_general (NUMERIC)
- cursos_desaprobados (INT)
- notas_bajas (INT)
- tendencia (VARCHAR)
- fecha_evaluacion (TIMESTAMP)

### puntos_criticos
- id (UUID, PK)
- tipo (VARCHAR)
- descripcion (TEXT)
- estudiante_id (FK -> estudiantes, NULLABLE)
- curso_id (FK -> cursos, NULLABLE)
- grado_id (FK -> grados, NULLABLE)
- severidad (VARCHAR)
- fecha_deteccion (TIMESTAMP)
- resuelta (BOOLEAN)

## 🔐 Autenticación

El sistema usa Supabase Auth. Por defecto, puedes usar:
- Email: `demo@test.com`
- Contraseña: `demo123456`

## 📱 Características Principales

### Dashboard
- Resumen de estudiantes, cursos y docentes
- Distribución de riesgo académico
- Últimas notas registradas
- Información general del período

### Gestión de Estudiantes
- Crear, editar y eliminar estudiantes
- Buscar estudiantes por nombre, apellidos o código
- Filtrar por grado y sección
- Ver estado del estudiante

### Notas
- Registro de notas por estudiante, curso y período
- Edición de notas registradas
- Consulta avanzada con filtros
- Análisis por estudiante

### Riesgo Académico
- Evaluación automática de riesgo (bajo, medio, alto, crítico)
- Cálculo basado en promedio general y cursos desaprobados
- Filtrado por nivel de riesgo
- Tendencia del rendimiento

### Puntos Críticos
- Detección automática de situaciones importantes
- Clasificación por tipo y severidad
- Marcado como resuelto
- Historial de detecciones

### Asistente IA
- Consultas en lenguaje natural
- Análisis de datos académicos
- Sugerencias basadas en patrones
- Preparado para integración con OpenAI, Gemini o Claude

## 📦 Dependencias principales

- React 18
- React Router 6
- Supabase JS
- Tailwind CSS
- Vite

## 🎨 Diseño

- Interfaz limpia y moderna
- Responsive design
- Tema claro
- Componentes reutilizables
- Accesibilidad considerada

## 🚀 Deployment

Para generar una versión de producción:

```bash
npm run build
npm run preview
```

Los archivos compilados estarán en la carpeta `dist/`.

## 📝 Licencia

Este proyecto es parte de una investigación académica.

## 👨‍💼 Autor

Desarrollado para: I.E.P. Los Ingenieros, Chincha, 2026

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, crea un fork y un pull request.

## ⚠️ Notas Importantes

- Este sistema está diseñado para educación secundaria
- Las evaluaciones de riesgo son preliminares y deben validarse con expertos
- Se recomienda complementar con evaluaciones cualitativas
- Los datos son confidenciales y deben protegerse adecuadamente
