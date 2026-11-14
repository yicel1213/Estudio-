# AulaViva

Aplicación web didáctica que convierte archivos **PDF**, **Word (`.docx`, `.rtf`)** o apuntes de texto en múltiples sistemas para enseñar y aprender de forma visual, clara y entretenida.

## Qué genera a partir de cada documento

- **Mapa Interactivo de Conceptos (8 a 10 puntos clave):** Organizado en 4–5 etapas progresivas, con explicación sencilla, puntos clave, analogía cotidiana, ejemplo del documento y modo doble (*Entender fácil* / *Cómo enseñarlo*).
- **Centro de Juegos (6 juegos activos):**
  1. **Trivia Relámpago (10, 20 o 30 preguntas):** Configurable bajo demanda, con rachas, reloj opcional de 25 s y explicación pedagógica inmediata.
  2. **Parejas y Memoria:** Dos modos jugables (*Conecta Conceptos* y *Juego de Memoria con Cartas*).
  3. **Verdadero o Falso Express:** Desafío de mito vs. realidad con corrección instantánea.
  4. **Clasificador por Categorías:** Agrupación activa de conceptos en sus categorías correspondientes.
  5. **Ordena y Completa:** Retos de secuencia paso a paso y banco de palabras clave.
  6. **Descifra el Término:** Juego de adivinar conceptos letra por letra con pistas de la materia.
- **Tarjetas Activas (Flashcards 3D):** Repaso con pista, truco nemotécnico y repetición de tarjetas difíciles hasta dominarlas.
- **Kit del Docente:** Método Feynman, preguntas socráticas, guion de clase en 3 actos, dinámicas grupales, ticket de salida y descarga en Markdown o impresión.

## Requisitos previos

- **Node.js 22 o superior** (permite ejecutar `node server.ts` directamente en producción)
- Una clave de **Gemini API** (`GEMINI_API_KEY`)

## Instalación y ejecución local

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/aulaviva.git
cd aulaviva

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env y coloca tu GEMINI_API_KEY

# 4. Iniciar en modo desarrollo (Express + Vite en el puerto 3000)
npm run dev
```

Abre `http://localhost:3000` en tu navegador.

## Compilación y producción

```bash
# Verificar tipos TypeScript
npm run lint

# Construir el frontend optimizado en dist/
npm run build

# Ejecutar el servidor en modo producción
NODE_ENV=production npm start
```

## Variables de entorno

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `GEMINI_API_KEY` | Sí | Clave de servidor para `@google/genai` (nunca se expone al navegador). |
| `PORT` | No | Puerto HTTP donde escucha Express (por defecto `3000`). |
| `NODE_ENV` | No | `development` usa Vite middleware; `production` sirve los estáticos de `dist/`. |
| `APP_URL` | No | URL pública de despliegue. |

## Estructura principal

```text
├── server.ts                 # Servidor Express, subida de PDF/Word/RTF y endpoints API
├── server/gemini.ts          # Esquema estructurado y llamadas a Gemini API en el servidor
├── src/
│   ├── App.tsx               # Contenedor principal y selector de sistemas/juegos
│   ├── types/didactic.ts     # Tipos compartidos del kit didáctico
│   ├── data/sampleKits.ts    # Materias de ejemplo listas para probar
│   └── components/           # Carga de archivos, mapa interactivo, 6 juegos, tarjetas y kit docente
└── .github/workflows/ci.yml  # Verificación automática de tipos y build en GitHub Actions
```
