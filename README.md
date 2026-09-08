# ConanGo 🐾 – Plataforma de Práctica ALCPT con Mecánicas Duolingo

ConanGo es una aplicación web interactiva diseñada para la preparación integral del **ALCPT** (American Language Course Placement Test). Combina el rigor de los estándares de evaluación militar con la dinamismo y gamificación estilo **Duolingo**, guiado por su mascota oficial **Conan**, un carismático perro Husky siberiano color café claro.

---

## 🌟 Características Principales

1. **Dos Fases del ALCPT**:
   - 🎧 **Listening**: Preguntas auditivas con reproductor de audio, diálogos, monólogos y órdenes de radio.
   - 📖 **Reading**: Comprensión lectora, gramática inglesa, tiempos verbales y vocabulario clave.

2. **Modalidades de Sesión**:
   - ⚡ **10, 30 y 50 Preguntas (Modo Vidas/Medallas)**: Inicias con **5 medallas**. Cada fallo resta una vida. Si tus vidas llegan a cero, la sesión se interrumpe y debes reintentarla.
   - ⏱️ **100 Preguntas (Modo Examen Oficial)**: Sin límite de vidas, con **temporizador de 60 minutos**, diagnóstico del porcentaje de inglés y revisión detallada de todas las preguntas incorrectas con explicaciones pedagógicas.

3. **Gamificación y Audio**:
   - Efectos sonoros para aciertos y errores (con sintetizador Web Audio API de respaldo para máxima fiabilidad).
   - Mascota animada con expresiones dinámicas (feliz, pensativo, celebrando, triste, graduado).
   - Contador de vidas con animación de sacudida y barra de progreso fluida.

4. **Soporte Híbrido Supabase + Almacenamiento Local**:
   - Funciona de forma 100% inmediata sin requerir configuración previa obligatoria gracias a su capa de almacenamiento local (*local mock*).
   - Listo para conectar con Supabase Auth y PostgreSQL con tablas relacionales.

---

## 🚀 Inicio Rápido

### 1. Instalación de Dependencias
```bash
npm install
```

### 2. Ejecutar Servidor de Desarrollo
```bash
npm run dev
```
Abre tu navegador en [http://localhost:3000](http://localhost:3000).

---

## 🗄️ Configuración de Supabase

Crea tu proyecto en [Supabase](https://supabase.com). Luego copia tu URL y tu clave anónima en `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-aqui
```

### Script SQL para las Tablas en Supabase

Ejecuta el siguiente script en el **SQL Editor** de tu panel de Supabase:

```sql
-- 1. Tabla de usuarios / cadetes
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  medals integer default 10,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabla de sesiones cortas (10, 30, 50 preguntas con vidas)
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  type text check (type in ('listening', 'reading')) not null,
  size integer check (size in (10, 30, 50, 100)) not null,
  correct integer not null,
  incorrect integer not null,
  percentage numeric(5,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tabla de resultados de examen oficial (100 preguntas)
create table if not exists public.exam_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  type text check (type in ('listening', 'reading')) not null,
  correct integer not null,
  incorrect integer not null,
  percentage numeric(5,2) not null,
  details jsonb, -- Almacena el desglose de preguntas incorrectas con su explicación
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.sessions enable row level security;
alter table public.exam_results enable row level security;

-- Políticas de lectura/escritura públicas para demostración
create policy "Lectura pública de sesiones" on public.sessions for select using (true);
create policy "Inserción de sesiones" on public.sessions for insert with check (true);
create policy "Lectura pública de exámenes" on public.exam_results for select using (true);
create policy "Inserción de exámenes" on public.exam_results for insert with check (true);
```

---

## 📝 Cómo Agregar o Modificar Preguntas

Las preguntas están organizadas en archivos JSON estandarizados dentro de la carpeta `data/`:

- `data/listening/formulas_listening.json` (Listening)
- `data/reading/formulas_reading.json` (Reading)

### Estructura de cada Pregunta

```json
{
  "id": 1,
  "type": "listening", // o "reading"
  "audioUrl": "https://tuservidor.com/audio.mp3", // (Opcional) URL del audio o null/vacío para sintetizador de voz integrado
  "question": "¿Qué orden emitió el oficial al pelotón?",
  "options": [
    "Mantener la posición de guardia",
    "Avanzar hacia el punto B",
    "Descargar los suministros del camión",
    "Retirarse a la base"
  ],
  "correctAnswer": 1, // Índice base 0 (en este caso la opción 1: "Avanzar...")
  "image": null, // (Opcional) URL o ruta local a una imagen de contexto
  "explanation": "El oficial indicó claramente 'Move forward to point Bravo'."
}
```

> **Nota pedagógica**: Si agregas menos preguntas de las requeridas en una sesión (por ejemplo 15 preguntas base y el usuario elige sesión de 30 o 100), ConanGo automáticamente baraja y selecciona de forma cíclica para garantizar sesiones completas y entretenidas.

---

## 🎨 Paleta de Colores y Estilo

- **Fondo General**: `#FFFFFF`
- **Texto Principal**: `#6B4423` (Café oscuro)
- **Texto Secundario / Bordes**: `#A67B5B` (Café claro)
- **Botones de Acción**: `#F59E0B` (Naranja cálido) con hover `#D97706`
- **Medallas y Logros**: `#FBBF24` (Dorado)
- **Aciertos**: `#DCFCE7` / `#15803D` (Verde suave)
- **Fallos**: `#FEE2E2` / `#B91C1C` (Rojo suave)

---

## 🛠️ Tecnologías Empleadas

- **Next.js 14** (App Router & React Server/Client Components)
- **TypeScript** (Tipado estricto en preguntas, sesiones y revisiones)
- **Tailwind CSS** (Diseño responsivo, sombras 3D y estados táctiles)
- **Framer Motion** (Animaciones de Conan, transiciones de pantalla y modales)
- **Supabase JS** (Cliente de autenticación y base de datos relacional)
- **Web Audio API & Web Speech API** (Sonidos y síntesis de voz en inglés)
- **Lucide Icons & Canvas Confetti** (Iconografía y celebraciones)
