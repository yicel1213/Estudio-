import { GoogleGenAI, Type, ThinkingLevel, createPartFromUri } from '@google/genai';
import type {
  DidacticKit,
  EducationLevel,
  LearningFocus,
  QuizQuestion,
} from '../src/types/didactic.ts';
import {
  buildLocalDidacticKitFromText,
  buildLocalQuizQuestions,
} from './localKitFallback.ts';

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const QUIZ_ITEM_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    question: { type: Type.STRING },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Exactamente 4 opciones de respuesta.',
    },
    correctIndex: { type: Type.INTEGER, description: 'Índice (0 a 3) de la opción correcta.' },
    explanation: { type: Type.STRING, description: 'Explicación pedagógica breve tras responder.' },
    difficulty: { type: Type.STRING, description: 'Uno de: basico, intermedio, reto' },
  },
  required: ['id', 'question', 'options', 'correctIndex', 'explanation', 'difficulty'],
};

const DIDACTIC_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    subjectTitle: {
      type: Type.STRING,
      description: 'Título claro y atractivo de la materia o tema principal del documento.',
    },
    discipline: {
      type: Type.STRING,
      description: 'Disciplina académica o área (ej. Biología, Historia, Derecho, Matemáticas).',
    },
    estimatedStudyMinutes: {
      type: Type.INTEGER,
      description: 'Minutos estimados para dominar este material con los juegos y mapa.',
    },
    executiveSummary: {
      type: Type.STRING,
      description: 'Resumen claro, ameno y sin tecnicismos innecesarios (3 frases).',
    },
    bigIdea: {
      type: Type.STRING,
      description: 'La gran idea central del documento en una sola frase memorable.',
    },
    stages: {
      type: Type.ARRAY,
      description: 'De 4 a 5 etapas progresivas para entender el tema paso a paso.',
      items: {
        type: Type.OBJECT,
        properties: {
          stageNumber: { type: Type.INTEGER },
          title: { type: Type.STRING },
          summary: { type: Type.STRING },
          keyTakeaway: { type: Type.STRING },
        },
        required: ['stageNumber', 'title', 'summary', 'keyTakeaway'],
      },
    },
    concepts: {
      type: Type.ARRAY,
      description: 'De 8 a 10 conceptos o puntos clave conectados entre sí para el mapa conceptual.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'ID corto como c1, c2, c3...' },
          title: { type: Type.STRING },
          shortLabel: { type: Type.STRING, description: 'Etiqueta corta de máximo 3 palabras.' },
          stage: { type: Type.INTEGER, description: 'Número de etapa (1..5).' },
          simpleExplanation: {
            type: Type.STRING,
            description: 'Explicación muy clara y fácil (1-2 frases).',
          },
          everydayAnalogy: {
            type: Type.STRING,
            description: 'Analogía cotidiana muy fácil de entender.',
          },
          documentExample: {
            type: Type.STRING,
            description: 'Ejemplo concreto basado en el documento.',
          },
          teachingTip: {
            type: Type.STRING,
            description: 'Consejo práctico para explicarlo en clase.',
          },
          commonMisconception: {
            type: Type.STRING,
            description: 'Confusión típica y cómo aclararla.',
          },
          keyPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '2 o 3 puntos clave ultra concretos para recordar de este nodo.',
          },
          connectsTo: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'IDs de otros conceptos conectados.',
          },
        },
        required: [
          'id',
          'title',
          'shortLabel',
          'stage',
          'simpleExplanation',
          'everydayAnalogy',
          'documentExample',
          'teachingTip',
          'commonMisconception',
          'keyPoints',
          'connectsTo',
        ],
      },
    },
    quiz: {
      type: Type.ARRAY,
      description: 'Exactamente 10 preguntas variadas de opción múltiple para Trivia Relámpago.',
      items: QUIZ_ITEM_SCHEMA,
    },
    matchPairs: {
      type: Type.ARRAY,
      description: 'Exactamente 6 pares concepto-definición para Conecta Parejas y Memoria.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          term: { type: Type.STRING, description: 'Término corto (máximo 4 palabras).' },
          definition: {
            type: Type.STRING,
            description: 'Definición o ejemplo claro (máximo 12 palabras).',
          },
          category: { type: Type.STRING },
        },
        required: ['id', 'term', 'definition', 'category'],
      },
    },
    sequenceChallenge: {
      type: Type.OBJECT,
      description: 'Un reto de ordenar de 4 a 5 pasos lógicos o cronológicos del tema.',
      properties: {
        title: { type: Type.STRING },
        instruction: { type: Type.STRING },
        steps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              order: { type: Type.INTEGER, description: 'Orden correcto empezando en 1.' },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ['id', 'order', 'title', 'description'],
          },
        },
      },
      required: ['title', 'instruction', 'steps'],
    },
    clozeExercises: {
      type: Type.ARRAY,
      description: '4 frases clave con un término faltante para completar ideas.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          beforeBlank: { type: Type.STRING },
          blankAnswer: {
            type: Type.STRING,
            description: 'Palabra o término corto exacto (1 a 2 palabras).',
          },
          afterBlank: { type: Type.STRING },
          hint: { type: Type.STRING },
        },
        required: ['id', 'beforeBlank', 'blankAnswer', 'afterBlank', 'hint'],
      },
    },
    trueFalseItems: {
      type: Type.ARRAY,
      description:
        '8 afirmaciones para el juego Verdadero o Falso Express (mezcla equilibrada de verdaderas y falsas con trampas comunes).',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          statement: { type: Type.STRING },
          isTrue: { type: Type.BOOLEAN },
          explanation: { type: Type.STRING },
        },
        required: ['id', 'statement', 'isTrue', 'explanation'],
      },
    },
    categorySortGame: {
      type: Type.OBJECT,
      description:
        'Juego de Clasificador de Conceptos con 3 categorías claras y 9 elementos a clasificar.',
      properties: {
        title: { type: Type.STRING },
        instruction: { type: Type.STRING },
        categories: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: 'cat1, cat2, cat3' },
              name: { type: Type.STRING },
            },
            required: ['id', 'name'],
          },
        },
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              label: { type: Type.STRING, description: 'Elemento o concepto corto (2-6 palabras).' },
              categoryId: { type: Type.STRING, description: 'ID de categoría (cat1, cat2, cat3).' },
              hint: { type: Type.STRING },
            },
            required: ['id', 'label', 'categoryId', 'hint'],
          },
        },
      },
      required: ['title', 'instruction', 'categories', 'items'],
    },
    flashcards: {
      type: Type.ARRAY,
      description: 'De 6 a 8 tarjetas activas (flashcards) con pregunta, respuesta, analogía y pista.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          front: { type: Type.STRING },
          back: { type: Type.STRING },
          analogy: { type: Type.STRING },
          hint: { type: Type.STRING },
        },
        required: ['id', 'front', 'back', 'analogy', 'hint'],
      },
    },
    feynmanGuide: {
      type: Type.OBJECT,
      properties: {
        childLevelExplanation: {
          type: Type.STRING,
          description: 'Explicación usando el Método Feynman como para alguien de 10 años.',
        },
        socraticQuestions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: '3 preguntas socráticas que despiertan curiosidad.',
        },
        realWorldHook: {
          type: Type.STRING,
          description: 'Un gancho o curiosidad de la vida real para abrir la clase.',
        },
      },
      required: ['childLevelExplanation', 'socraticQuestions', 'realWorldHook'],
    },
    teachingMethods: {
      type: Type.ARRAY,
      description: '2 dinámicas o juegos grupales activos para enseñar esta materia fácilmente.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          durationMinutes: { type: Type.INTEGER },
          bestFor: { type: Type.STRING },
          objective: { type: Type.STRING },
          steps: { type: Type.ARRAY, items: { type: Type.STRING } },
          materialsNeeded: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['id', 'name', 'durationMinutes', 'bestFor', 'objective', 'steps', 'materialsNeeded'],
      },
    },
    lessonPlanActs: {
      type: Type.ARRAY,
      description: 'Guion de clase o estudio en 3 actos (Inicio, Desarrollo Activo, Cierre).',
      items: {
        type: Type.OBJECT,
        properties: {
          actNumber: { type: Type.INTEGER },
          title: { type: Type.STRING },
          durationMinutes: { type: Type.INTEGER },
          teacherAction: { type: Type.STRING },
          studentActivity: { type: Type.STRING },
        },
        required: ['actNumber', 'title', 'durationMinutes', 'teacherAction', 'studentActivity'],
      },
    },
    exitTicketQuestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '2 preguntas rápidas de cierre (ticket de salida).',
    },
  },
  required: [
    'subjectTitle',
    'discipline',
    'estimatedStudyMinutes',
    'executiveSummary',
    'bigIdea',
    'stages',
    'concepts',
    'quiz',
    'matchPairs',
    'sequenceChallenge',
    'clozeExercises',
    'trueFalseItems',
    'categorySortGame',
    'flashcards',
    'feynmanGuide',
    'teachingMethods',
    'lessonPlanActs',
    'exitTicketQuestions',
  ],
};

export interface AnalyzeProgressEvent {
  stage: string;
  message: string;
  percent: number;
}

export interface AnalyzeDocumentParams {
  fileName: string;
  sourceType: 'pdf' | 'word' | 'texto';
  level: EducationLevel;
  focus: LearningFocus;
  extractedText?: string;
  pdfBase64?: string;
  pdfFilePath?: string;
  onProgress?: (event: AnalyzeProgressEvent) => void;
}

const LEVEL_DESCRIPTIONS: Record<EducationLevel, string> = {
  primaria: 'Primaria (lenguaje muy sencillo, ejemplos cotidianos visuales y juegos ágiles)',
  secundaria: 'Secundaria (equilibrio entre claridad, analogías memorables y rigor conceptual)',
  preparatoria: 'Preparatoria / Bachillerato (conceptos precisos, conexiones causales y retos analíticos)',
  universidad: 'Universidad (rigor técnico mantenido pero explicado de forma intuitiva y aplicable)',
  autoaprendizaje: 'Autoaprendizaje general (claro, práctico, directo al grano y motivador)',
};

function sanitizeAndTrimText(raw: string, maxChars = 34000): string {
  const cleaned = raw
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (cleaned.length <= maxChars) return cleaned;
  const headSize = 24000;
  const tailSize = maxChars - headSize - 60;
  return `${cleaned.slice(0, headSize)}\n\n[...contenido intermedio resumido por extensión...]\n\n${cleaned.slice(-tailSize)}`;
}

function cleanJsonResponse(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }
  return cleaned;
}

function parseJsonSafely(raw: string): Record<string, unknown> {
  const cleaned = cleanJsonResponse(raw);
  try {
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)) as Record<string, unknown>;
    }
    throw new SyntaxError('No se pudo interpretar el JSON generado por el modelo.');
  }
}

function normalizeQuizList(rawList: unknown[], startOffset = 0): QuizQuestion[] {
  return rawList.map((rawItem, idx) => {
    const q = (rawItem && typeof rawItem === 'object' ? rawItem : {}) as Record<string, unknown>;
    const options = Array.isArray(q.options) ? q.options.map(String).slice(0, 4) : [];
    while (options.length < 4) {
      options.push(`Opción ${options.length + 1}`);
    }
    const rawIdx = Number(q.correctIndex);
    const correctIndex = Number.isInteger(rawIdx) && rawIdx >= 0 && rawIdx < 4 ? rawIdx : 0;
    const diff: 'basico' | 'intermedio' | 'reto' =
      q.difficulty === 'basico' || q.difficulty === 'intermedio' || q.difficulty === 'reto'
        ? q.difficulty
        : 'basico';
    return {
      id: String(q.id || `q-${startOffset + idx + 1}`),
      question: String(q.question || ''),
      options,
      correctIndex,
      explanation: String(q.explanation || ''),
      difficulty: diff,
    };
  });
}

let geminiQueue: Promise<void> = Promise.resolve();

function enqueueGeminiCall<T>(fn: () => Promise<T>): Promise<T> {
  const result = geminiQueue.then(fn, fn);
  geminiQueue = result.then(
    () => undefined,
    () => undefined
  );
  return result;
}

function isRateLimitError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();
  return (
    msg.includes('RESOURCE_EXHAUSTED') ||
    /"code"\s*:\s*429\b/.test(msg) ||
    /\bstatus\s*[:=]\s*429\b/i.test(msg) ||
    lower.includes('too many requests') ||
    lower.includes('ratelimitexceeded') ||
    lower.includes('quota exceeded')
  );
}

function extractRetryDelayMs(err: unknown, attempt: number): number {
  const msg = err instanceof Error ? err.message : String(err);
  const secMatch = msg.match(/retry(?:Delay)?["'\s:]*(\d+(?:\.\d+)?)s/i);
  if (secMatch) {
    const parsedMs = Math.ceil(Number(secMatch[1]) * 1000);
    if (Number.isFinite(parsedMs) && parsedMs > 500 && parsedMs <= 20000) {
      return parsedMs;
    }
  }
  const schedule = [3500, 7000, 12000];
  return schedule[Math.min(attempt - 1, schedule.length - 1)];
}

type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } }
  | ReturnType<typeof createPartFromUri>;

async function callGeminiWithRetry(
  buildParts: (attempt: number) => GeminiPart[],
  systemInstruction: string,
  responseSchema: Record<string, unknown>,
  onProgress?: (event: AnalyzeProgressEvent) => void
) {
  const ai = getAiClient();
  let lastError: unknown = null;
  const maxAttempts = 4;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const parts = buildParts(attempt);
      const stream = await enqueueGeminiCall(async () => {
        return ai.models.generateContentStream({
          model: 'gemini-4-hydrogen',
          contents: { parts },
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema,
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.LOW,
            },
          },
        });
      });

      let fullText = '';
      let lastNotifiedChars = 0;

      for await (const chunk of stream) {
        const piece = chunk.text ?? '';
        if (piece) {
          fullText += piece;
          if (onProgress && fullText.length - lastNotifiedChars >= 1200) {
            lastNotifiedChars = fullText.length;
            const approxPct = Math.min(92, 35 + Math.round((fullText.length / 18000) * 57));
            let message = 'Creando mapa conceptual y explicaciones simples...';
            if (approxPct >= 55 && approxPct < 75) {
              message = 'Diseñando trivia, pares de memoria y juegos interactivos...';
            } else if (approxPct >= 75) {
              message = 'Preparando tarjetas de estudio y guía práctica para clase...';
            }
            onProgress({
              stage: 'generating',
              message,
              percent: approxPct,
            });
          }
        }
      }

      const rawText = cleanJsonResponse(fullText);
      if (!rawText) {
        throw new Error('EMPTY_MODEL_RESPONSE');
      }

      return parseJsonSafely(rawText);
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      const rateLimited = isRateLimitError(err);
      const isNonRetryable =
        !rateLimited &&
        (/"code"\s*:\s*403\b/.test(msg) ||
          msg.includes('PERMISSION_DENIED') ||
          msg.includes('API_KEY_INVALID') ||
          msg.includes('INVALID_ARGUMENT') ||
          /"code"\s*:\s*404\b/.test(msg) ||
          msg.includes('MISSING_API_KEY'));
      if (isNonRetryable || attempt === maxAttempts) {
        throw err;
      }

      const waitMs = rateLimited ? extractRetryDelayMs(err, attempt) : 1200 * attempt;
      onProgress?.({
        stage: 'retrying',
        message: rateLimited
          ? `Esperando ${Math.ceil(waitMs / 1000)} s por turno de procesamiento y reintentando...`
          : 'Reintentando lectura del documento para asegurar calidad...',
        percent: 32,
      });
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }

  throw lastError ?? new Error('EMPTY_MODEL_RESPONSE');
}

export async function generateDidacticKitFromInput(
  params: AnalyzeDocumentParams
): Promise<DidacticKit> {
  const focusDescriptions: Record<LearningFocus, string> = {
    aprender: 'Prioriza claridad para estudiar solo, mnemotecnias, juegos de memoria y autoevaluación.',
    ensenar: 'Prioriza analogías para explicar frente a grupo, dinámicas participativas y errores comunes a prevenir.',
    ambos: 'Equilibra recursos para aprender rápido y herramientas prácticas para enseñar el tema.',
  };

  const systemInstruction = `Eres un diseñador instruccional experto y pedagogo creativo.
Transforma el material académico adjunto en un sistema didáctico completo, claro, visual y divertido en ESPAÑOL.

Reglas estrictas:
1. Todo el contenido debe basarse fielmente en la materia del archivo o texto proporcionado.
2. Adapta el vocabulario al nivel: ${LEVEL_DESCRIPTIONS[params.level]}.
3. Enfoque: ${focusDescriptions[params.focus]}.
4. En "concepts", genera entre 8 y 10 nodos conectados distribuidos en 4 o 5 etapas, cada uno con 2 o 3 "keyPoints" cortos y "connectsTo" apuntando solo a IDs reales del mismo arreglo ("c1", "c2", etc.).
5. En "quiz", genera exactamente 10 preguntas variadas (mezcla de basico, intermedio y reto) con 4 opciones cada una.
6. En "trueFalseItems", genera 8 afirmaciones equilibradas (alrededor de la mitad verdaderas y la mitad falsas).
7. En "categorySortGame", define 3 categorías reales de la materia y 9 elementos (3 por categoría) donde "categoryId" coincida con "cat1", "cat2" o "cat3".
8. Sé claro, ágil y directo (1-2 frases por explicación) para que sea fácil de leer y enseñar. Responde EXCLUSIVAMENTE con JSON válido siguiendo el esquema.`;

  if (!params.pdfBase64 && !params.pdfFilePath && !params.extractedText) {
    throw new Error('NO_CONTENT');
  }

  let uploadedRemoteName: string | undefined;
  let uploadedFilePart: ReturnType<typeof createPartFromUri> | null = null;

  if (params.pdfFilePath) {
    params.onProgress?.({
      stage: 'generating',
      message: 'Preparando PDF extenso para lectura completa...',
      percent: 31,
    });
    const ai = getAiClient();
    const uploaded = await ai.files.upload({
      file: params.pdfFilePath,
      config: { mimeType: 'application/pdf' },
    });
    uploadedRemoteName = uploaded.name;
    if (uploaded.uri) {
      uploadedFilePart = createPartFromUri(uploaded.uri, uploaded.mimeType || 'application/pdf');
    }
  }

  const buildParts = (attempt: number): GeminiPart[] => {
    if (uploadedFilePart) {
      return [
        uploadedFilePart,
        {
          text: `Analiza este documento PDF ("${params.fileName}") y construye todo el sistema didáctico con mapa de 8-10 puntos, trivia de 10 preguntas, juegos interactivos, tarjetas y guía docente.`,
        },
      ];
    }
    if (params.pdfBase64) {
      return [
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: params.pdfBase64,
          },
        },
        {
          text: `Analiza este documento PDF ("${params.fileName}") y construye todo el sistema didáctico con mapa de 8-10 puntos, trivia de 10 preguntas, juegos interactivos, tarjetas y guía docente.`,
        },
      ];
    }
    const maxChars = attempt === 1 ? 24000 : attempt === 2 ? 15000 : 9000;
    const trimmed = sanitizeAndTrimText(params.extractedText || '', maxChars);
    return [
      {
        text: `Analiza el siguiente material extraído de "${params.fileName}" y construye todo el sistema didáctico con mapa de 8-10 puntos, trivia de 10 preguntas, juegos interactivos, tarjetas y guía docente:\n\n---\n${trimmed}\n---`,
      },
    ];
  };

  params.onProgress?.({
    stage: 'generating',
    message: 'Analizando conceptos principales y diseñando los sistemas didácticos...',
    percent: 35,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parsed: Record<string, any>;
  try {
    parsed = await callGeminiWithRetry(
      buildParts,
      systemInstruction,
      DIDACTIC_RESPONSE_SCHEMA,
      params.onProgress
    );
  } catch (err) {
    if (isRateLimitError(err) && params.extractedText && params.extractedText.trim().length >= 3) {
      params.onProgress?.({
        stage: 'generating',
        message: 'Finalizando sistemas didácticos directamente desde tu documento...',
        percent: 88,
      });
      return buildLocalDidacticKitFromText({
        fileName: params.fileName,
        sourceType: params.sourceType,
        level: params.level,
        focus: params.focus,
        extractedText: params.extractedText,
      });
    }
    throw err;
  } finally {
    if (uploadedRemoteName) {
      try {
        const ai = getAiClient();
        await ai.files.delete({ name: uploadedRemoteName });
      } catch {
        // Non-fatal cleanup
      }
    }
  }

  const concepts = Array.isArray(parsed.concepts) ? parsed.concepts : [];
  const validConceptIds = new Set(concepts.map((c: { id: string }) => c.id));
  const normalizedConcepts = concepts.map((c: Record<string, unknown>, idx: number) => ({
    id: String(c.id || `c${idx + 1}`),
    title: String(c.title || `Concepto ${idx + 1}`),
    shortLabel: String(c.shortLabel || c.title || `Concepto ${idx + 1}`),
    stage: Number(c.stage) || 1,
    simpleExplanation: String(c.simpleExplanation || ''),
    everydayAnalogy: String(c.everydayAnalogy || ''),
    documentExample: String(c.documentExample || ''),
    teachingTip: String(c.teachingTip || ''),
    commonMisconception: String(c.commonMisconception || ''),
    keyPoints: Array.isArray(c.keyPoints) ? c.keyPoints.map(String) : [],
    connectsTo: Array.isArray(c.connectsTo)
      ? c.connectsTo.filter(
          (target: unknown): target is string =>
            typeof target === 'string' && validConceptIds.has(target) && target !== c.id
        )
      : [],
  }));

  const normalizedQuiz = normalizeQuizList(Array.isArray(parsed.quiz) ? parsed.quiz : []);

  const rawCategories = Array.isArray(parsed.categorySortGame?.categories)
    ? parsed.categorySortGame.categories
    : [];
  const validCatIds = new Set(rawCategories.map((cat: { id: string }) => cat.id));
  const fallbackCatId = rawCategories[0]?.id || 'cat1';

  const normalizedSortItems = (
    Array.isArray(parsed.categorySortGame?.items) ? parsed.categorySortGame.items : []
  ).map((it: Record<string, unknown>, idx: number) => ({
    id: String(it.id || `cs-${idx + 1}`),
    label: String(it.label || ''),
    categoryId:
      typeof it.categoryId === 'string' && validCatIds.has(it.categoryId)
        ? it.categoryId
        : fallbackCatId,
    hint: String(it.hint || ''),
  }));

  const contextSnapshot = params.extractedText
    ? params.extractedText.slice(0, 28000)
    : `${parsed.executiveSummary || ''}\n${normalizedConcepts
        .map((c) => `${c.title}: ${c.simpleExplanation} ${c.documentExample}`)
        .join('\n')}`;

  const kit: DidacticKit = {
    id: `kit-${Date.now()}`,
    sourceFileName: params.fileName,
    sourceType: params.sourceType,
    sourceTextContext: contextSnapshot,
    subjectTitle: String(parsed.subjectTitle || params.fileName),
    discipline: String(parsed.discipline || 'Materia General'),
    level: params.level,
    focus: params.focus,
    estimatedStudyMinutes: Math.max(5, Number(parsed.estimatedStudyMinutes) || 15),
    executiveSummary: String(parsed.executiveSummary || ''),
    bigIdea: String(parsed.bigIdea || ''),
    stages: Array.isArray(parsed.stages) ? parsed.stages : [],
    concepts: normalizedConcepts,
    quiz: normalizedQuiz,
    matchPairs: Array.isArray(parsed.matchPairs) ? parsed.matchPairs : [],
    sequenceChallenge: parsed.sequenceChallenge || {
      title: 'Orden Lógico del Tema',
      instruction: 'Ordena los pasos principales de esta materia.',
      steps: [],
    },
    clozeExercises: Array.isArray(parsed.clozeExercises) ? parsed.clozeExercises : [],
    trueFalseItems: Array.isArray(parsed.trueFalseItems) ? parsed.trueFalseItems : [],
    categorySortGame: {
      title: String(parsed.categorySortGame?.title || 'Clasificador de Conceptos'),
      instruction: String(
        parsed.categorySortGame?.instruction ||
          'Asigna cada elemento a la categoría correcta de la materia.'
      ),
      categories: rawCategories,
      items: normalizedSortItems,
    },
    flashcards: Array.isArray(parsed.flashcards) ? parsed.flashcards : [],
    feynmanGuide: parsed.feynmanGuide || {
      childLevelExplanation: String(parsed.executiveSummary || ''),
      socraticQuestions: [],
      realWorldHook: String(parsed.bigIdea || ''),
    },
    teachingMethods: Array.isArray(parsed.teachingMethods) ? parsed.teachingMethods : [],
    lessonPlanActs: Array.isArray(parsed.lessonPlanActs) ? parsed.lessonPlanActs : [],
    exitTicketQuestions: Array.isArray(parsed.exitTicketQuestions) ? parsed.exitTicketQuestions : [],
  };

  return kit;
}

export async function generateAdditionalQuizQuestions(params: {
  subjectTitle: string;
  discipline: string;
  level: EducationLevel;
  sourceTextContext: string;
  existingQuestions: string[];
  neededCount: number;
}): Promise<QuizQuestion[]> {
  const count = Math.min(25, Math.max(1, params.neededCount));
  const systemInstruction = `Eres un profesor experto creando preguntas de opción múltiple en ESPAÑOL para Trivia educativa.
Nivel: ${LEVEL_DESCRIPTIONS[params.level]}.
Materia: ${params.subjectTitle} (${params.discipline}).
Reglas:
1. Genera EXACTAMENTE ${count} preguntas nuevas, variadas y didácticas basadas en el material proporcionado.
2. NO repitas ninguna de las preguntas ya existentes que se listan abajo.
3. Cada pregunta debe tener exactamente 4 opciones claras, "correctIndex" entre 0 y 3, una explicación breve tras responder, y "difficulty" igual a "basico", "intermedio" o "reto".`;

  const existingList = params.existingQuestions
    .slice(0, 40)
    .map((q, i) => `${i + 1}. ${q}`)
    .join('\n');

  const promptText = `Material base de la materia:\n---\n${params.sourceTextContext.slice(0, 26000)}\n---\n\nPreguntas ya existentes (NO repetir):\n${existingList || '(ninguna)'}\n\nGenera exactamente ${count} preguntas nuevas y distintas para ampliar la trivia.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      questions: {
        type: Type.ARRAY,
        items: QUIZ_ITEM_SCHEMA,
      },
    },
    required: ['questions'],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parsed: Record<string, any>;
  try {
    parsed = await callGeminiWithRetry(
      () => [{ text: promptText }],
      systemInstruction,
      schema
    );
  } catch (err) {
    if (isRateLimitError(err)) {
      return buildLocalQuizQuestions({
        sourceTextContext: params.sourceTextContext,
        existingQuestions: params.existingQuestions,
        neededCount: count,
      });
    }
    throw err;
  }

  const list = Array.isArray(parsed.questions) ? parsed.questions : [];
  return normalizeQuizList(list, params.existingQuestions.length);
}
