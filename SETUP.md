# 🚀 Guía Completa de Instalación y Setup

## Paso 1: Preparar el Entorno

### 1.1 Requisitos Previos
- Node.js 16+ instalado
- npm o yarn
- Cuenta de Supabase (gratuita en https://supabase.com)
- Git (opcional)

Verifica tu versión de Node:
```bash
node --version
npm --version
```

## Paso 2: Crear Proyecto en Supabase

### 2.1 Crear Proyecto
1. Ve a https://supabase.com
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Espera a que se complete (5-10 minutos)

### 2.2 Obtener Credenciales
1. Ve a "Settings" → "API"
2. Copia:
   - **Project URL** (será tu VITE_SUPABASE_URL)
   - **anon public** key (será tu VITE_SUPABASE_ANON_KEY)
3. Guarda estos valores en un lugar seguro

## Paso 3: Configurar Base de Datos

### 3.1 Ejecutar Script SQL
1. En Supabase, ve a "SQL Editor"
2. Crea una nueva query
3. Copia el contenido de `SQL_SETUP.sql`
4. Pégalo en el editor
5. Haz clic en "Run"
6. Espera a que se complete

### 3.2 Verificar Tablas
1. Ve a "Table Editor"
2. Deberías ver las siguientes tablas:
   - grados
   - secciones
   - cursos
   - periodos
   - estudiantes
   - notas
   - evaluaciones_riesgo
   - puntos_criticos

## Paso 4: Configurar el Proyecto Local

### 4.1 Instalar Dependencias
```bash
cd /Users/gtrujils/Documents/GitHub/school
npm install
```

### 4.2 Configurar Variables de Entorno
1. Abre el archivo `.env.local`
2. Reemplaza los valores de placeholder con tus credenciales:
   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```

### 4.3 Verificar Estructura
Verifica que la estructura sea correcta:
```
school/
├── src/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.local
└── README.md
```

## Paso 5: Ejecutar la Aplicación

### 5.1 Iniciar Servidor de Desarrollo
```bash
npm run dev
```

### 5.2 Abrir en el Navegador
La aplicación se abrirá automáticamente en:
```
http://localhost:5173
```

Si no se abre automáticamente, abre tu navegador y ve a esa URL.

## Paso 6: Crear Primer Usuario

### 6.1 Registro
1. Haz clic en "¿No tienes cuenta? Regístrate"
2. Ingresa:
   - Nombre: Tu nombre
   - Email: tu@ejemplo.com
   - Contraseña: Una contraseña segura (mín 6 caracteres)
3. Haz clic en "Crear cuenta"

### 6.2 Verificación
Supabase envía un email de confirmación. Si estás en desarrollo, puedes:
1. Ir a Supabase → Auth → Users
2. Copiar el link de confirmación del email no confirmado
3. O simplemente esperar a que Supabase permita el acceso (varía según configuración)

## Paso 7: Cargar Datos Iniciales

### 7.1 Crear Grados
1. Ve a "Grados" en el menú lateral
2. Haz clic en "+ Nuevo Grado"
3. Crea:
   - 1.º (nivel 1)
   - 2.º (nivel 2)
   - 3.º (nivel 3)
   - 4.º (nivel 4)
   - 5.º (nivel 5)

### 7.2 Crear Secciones
1. Ve a "Secciones"
2. Crea secciones para cada grado:
   - A, B, C (o según tu institución)

### 7.3 Crear Cursos
1. Ve a "Cursos"
2. Crea cursos:
   - Matemática (MAT)
   - Comunicación (COM)
   - Ciencia y Tecnología (CYT)
   - Inglés (ING)
   - Historia (HIS)
   - Otros según tu currículo

### 7.4 Crear Períodos Académicos
1. Ve a "Períodos"
2. Crea períodos para 2026:
   - Primer bimestre (1)
   - Segundo bimestre (2)
   - Tercer bimestre (3)
   - Cuarto bimestre (4)

### 7.5 Crear Estudiantes
1. Ve a "Estudiantes"
2. Haz clic en "+ Nuevo Estudiante"
3. Completa:
   - Nombre, Apellidos
   - Código (EST-001, EST-002, etc.)
   - Grado y Sección
4. Crea al menos 5-10 estudiantes de prueba

## Paso 8: Registrar Notas

### 8.1 Acceder a Registro de Notas
1. Ve a "Notas" en el menú
2. Selecciona:
   - Grado
   - Sección
   - Curso
   - Período

### 8.2 Registrar Notas
1. Selecciona un estudiante
2. Ingresa una nota (0-20)
3. Haz clic en "Registrar Nota"
4. Repite para varios estudiantes y cursos

**Notas de Prueba Recomendadas:**
- Estudiante 1: 18, 19, 18 (bajo riesgo)
- Estudiante 2: 14, 15, 13 (riesgo medio)
- Estudiante 3: 10, 9, 8 (alto riesgo)
- Estudiante 4: 5, 6, 5 (riesgo crítico)

## Paso 9: Ver Resultados

### 9.1 Dashboard
1. Ve a "Dashboard"
2. Verifica que muestre:
   - Total de estudiantes
   - Total de cursos
   - Últimas notas registradas

### 9.2 Riesgo Académico
1. Ve a "Riesgo Académico"
2. Verifica la distribución de riesgos
3. Filtra por nivel de riesgo

### 9.3 Puntos Críticos
1. Ve a "Puntos Críticos"
2. Verifica las alertas detectadas

### 9.4 Asistente IA
1. Ve a "Asistente IA"
2. Prueba preguntas como:
   - "¿Cuántos estudiantes hay?"
   - "¿Cuál es el promedio general?"
   - "¿Qué estudiantes tienen riesgo alto?"

## Troubleshooting

### Error: "Cannot find module 'react'"
**Solución:** Ejecuta `npm install` nuevamente

### Error: "Supabase connection failed"
**Solución:** Verifica las credenciales en `.env.local`

### Notas no se guardan
**Solución:** 
1. Verifica que las tablas existan en Supabase
2. Verifica que las políticas RLS están habilitadas
3. Comprueba los permisos en Supabase

### No puedo iniciar sesión
**Solución:**
1. Verifica que el usuario se creó en Supabase → Auth → Users
2. Confirma que está verificado el email
3. Intenta con una contraseña más segura

## Comandos Útiles

```bash
# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Ver preview de producción
npm run preview

# Instalar nuevas dependencias
npm install nombre-paquete

# Actualizar todas las dependencias
npm update
```

## Siguiente Paso: Producción

Una vez que todo funcione localmente:

1. **Compilar para producción:**
   ```bash
   npm run build
   ```

2. **Opciones de deployment:**
   - Vercel (recomendado para Vite)
   - Netlify
   - GitHub Pages
   - Railway
   - Render

3. **Configurar variables en producción:**
   - Actualiza `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en el host

## 📞 Soporte

Para más información:
- Documentación de React: https://react.dev
- Documentación de Supabase: https://supabase.com/docs
- Documentación de Vite: https://vitejs.dev
- Documentación de Tailwind: https://tailwindcss.com

## ✅ Checklist Final

- [ ] Node.js y npm instalados
- [ ] Proyecto Supabase creado
- [ ] Variables de entorno configuradas
- [ ] Script SQL ejecutado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Servidor iniciado (`npm run dev`)
- [ ] Primera sesión iniciada
- [ ] Datos iniciales cargados
- [ ] Notas registradas
- [ ] Dashboard funcionando
- [ ] Análisis de riesgo funcionando

¡Listo! Tu sistema está completamente funcional.
