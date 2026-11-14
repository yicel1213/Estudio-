import type {
  DidacticKit,
  EducationLevel,
  LearningFocus,
  QuizQuestion,
} from '../src/types/didactic.ts';

const STOPWORDS = new Set([
  'para', 'como', 'entre', 'sobre', 'desde', 'hasta', 'donde', 'cuando', 'porque',
  'aunque', 'pero', 'sino', 'también', 'tambien', 'estos', 'estas', 'aquel', 'aquella',
  'cada', 'todo', 'toda', 'todos', 'todas', 'algo', 'algun', 'alguna', 'algunos',
  'tiene', 'tienen', 'puede', 'pueden', 'hacer', 'hace', 'forma', 'parte', 'manera',
  'medio', 'traves', 'través', 'siendo', 'sido', 'esta', 'este', 'esto', 'esos',
  'esas', 'unos', 'unas', 'cual', 'cuales', 'quien', 'quienes', 'cuyo', 'cuya',
  'más', 'menos', 'muy', 'bien', 'solo', 'sólo', 'bajo', 'ante', 'tras', 'hacia',
  'según', 'segun', 'mediante', 'durante', 'dentro', 'fuera', 'antes', 'después',
  'despues', 'luego', 'entonces', 'además', 'ademas', 'así', 'asi', 'mismo', 'misma',
  'otro', 'otra', 'otros', 'otras', 'gran', 'mayor', 'menor', 'nuevo', 'nueva',
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'are', 'was',
]);

function splitSentences(text: string): string[] {
  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();

  const rawParts = normalized
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 25 && /[a-zA-ZáéíóúÁÉÍÓÚñÑ]{3,}/.test(s));

  if (rawParts.length > 0) return rawParts;

  // Fallback for short or unpunctuated text
  return normalized
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 4);
}

function extractKeywords(text: string, limit = 16): string[] {
  const words = text.match(/[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]{4,}/g) || [];
  const freq = new Map<string, { count: number; original: string }>();

  for (const w of words) {
    const lower = w.toLowerCase();
    if (STOPWORDS.has(lower)) continue;
    const entry = freq.get(lower);
    if (entry) {
      entry.count += 1;
    } else {
      freq.set(lower, { count: 1, original: w });
    }
  }

  return Array.from(freq.values())
    .sort((a, b) => b.count - a.count || b.original.length - a.original.length)
    .slice(0, limit)
    .map((item) => item.original.charAt(0).toUpperCase() + item.original.slice(1));
}

function shorten(str: string, maxLen: number): string {
  const cleaned = str.trim();
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen - 1).trim()}…`;
}

function cleanFileTitle(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
  if (!base) return 'Materia del Documento';
  return base.charAt(0).toUpperCase() + base.slice(1);
}

export function buildLocalQuizQuestions(params: {
  sourceTextContext: string;
  existingQuestions: string[];
  neededCount: number;
}): QuizQuestion[] {
  const sentences = splitSentences(params.sourceTextContext);
  const keywords = extractKeywords(params.sourceTextContext, 30);
  const existingSet = new Set(params.existingQuestions.map((q) => q.trim().toLowerCase()));
  const results: QuizQuestion[] = [];

  const poolKeywords = keywords.length >= 4 ? keywords : ['Concepto', 'Proceso', 'Elemento', 'Método'];

  for (let i = 0; i < params.neededCount + 15 && results.length < params.neededCount; i++) {
    const sentence = sentences[i % Math.max(1, sentences.length)] || params.sourceTextContext.slice(0, 140);
    const wordsInSentence = (sentence.match(/[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]{5,}/g) || []).filter(
      (w) => !STOPWORDS.has(w.toLowerCase())
    );
    const targetWord =
      wordsInSentence[i % Math.max(1, wordsInSentence.length)] ||
      poolKeywords[i % poolKeywords.length];
    const targetCap = targetWord.charAt(0).toUpperCase() + targetWord.slice(1);

    const masked = sentence.replace(new RegExp(`\\b${targetWord}\\b`, 'i'), '______');
    const questionText =
      masked !== sentence
        ? `Según el documento, ¿qué término completa correctamente esta idea? "${shorten(masked, 130)}"`
        : `En relación con "${targetCap}", ¿cuál enunciado coincide con el contenido del documento?`;

    if (existingSet.has(questionText.toLowerCase())) continue;
    existingSet.add(questionText.toLowerCase());

    const distractors = poolKeywords
      .filter((k) => k.toLowerCase() !== targetCap.toLowerCase())
      .slice(0, 8);
    while (distractors.length < 3) {
      distractors.push(`Elemento ${distractors.length + 1}`);
    }

    const correctIndex = i % 4;
    const options: string[] = [];
    let dIdx = 0;
    for (let opt = 0; opt < 4; opt++) {
      if (opt === correctIndex) {
        options.push(targetCap);
      } else {
        options.push(distractors[dIdx % distractors.length]);
        dIdx += 1;
      }
    }

    const difficulty: 'basico' | 'intermedio' | 'reto' =
      i % 3 === 0 ? 'basico' : i % 3 === 1 ? 'intermedio' : 'reto';

    results.push({
      id: `q-local-${Date.now()}-${i + 1}`,
      question: questionText,
      options,
      correctIndex,
      explanation: `Idea del documento: ${shorten(sentence, 150)}`,
      difficulty,
    });
  }

  return results;
}

export function buildLocalDidacticKitFromText(params: {
  fileName: string;
  sourceType: 'pdf' | 'word' | 'texto';
  level: EducationLevel;
  focus: LearningFocus;
  extractedText: string;
}): DidacticKit {
  const text = params.extractedText.trim();
  const sentences = splitSentences(text);
  const keywords = extractKeywords(text, 16);
  const titleFromFile = cleanFileTitle(params.fileName);

  const safeKeywords = [...keywords];
  const defaults = ['Fundamentos', 'Estructura', 'Aplicación', 'Proceso', 'Análisis', 'Relación', 'Concepto', 'Síntesis'];
  for (const d of defaults) {
    if (safeKeywords.length >= 10) break;
    if (!safeKeywords.some((k) => k.toLowerCase() === d.toLowerCase())) {
      safeKeywords.push(d);
    }
  }

  const safeSentences = [...sentences];
  while (safeSentences.length < 10) {
    safeSentences.push(
      safeSentences[safeSentences.length % Math.max(1, sentences.length)] ||
        shorten(text, 140)
    );
  }

  const stageNames = [
    '1. Bases e ideas iniciales',
    '2. Elementos centrales',
    '3. Mecanismo y funcionamiento',
    '4. Relación y aplicación práctica',
  ];

  const stages = stageNames.map((name, idx) => ({
    stageNumber: idx + 1,
    title: name,
    summary: shorten(safeSentences[idx * 2] || safeSentences[idx], 150),
    keyTakeaway: `Clave principal: ${safeKeywords[idx] || titleFromFile}.`,
  }));

  const conceptCount = Math.min(8, Math.max(6, Math.min(safeKeywords.length, safeSentences.length)));
  const concepts = Array.from({ length: conceptCount }, (_, idx) => {
    const id = `c${idx + 1}`;
    const kw = safeKeywords[idx];
    const sentence = safeSentences[idx];
    const stage = Math.min(4, Math.floor((idx * 4) / conceptCount) + 1);
    const nextIds: string[] = [];
    if (idx + 1 < conceptCount) nextIds.push(`c${idx + 2}`);
    if (idx + 2 < conceptCount && idx % 2 === 0) nextIds.push(`c${idx + 3}`);

    return {
      id,
      title: `${kw} en ${shorten(titleFromFile, 28)}`,
      shortLabel: shorten(kw, 24),
      stage,
      simpleExplanation: shorten(sentence, 170),
      everydayAnalogy: `Piensa en "${kw}" como una pieza clave dentro de un equipo: si cumple su función, todo el sistema avanza sin trabas.`,
      documentExample: shorten(safeSentences[(idx + 1) % safeSentences.length], 160),
      teachingTip: `Pide al grupo explicar "${kw}" con sus propias palabras y conectarlo con ${safeKeywords[(idx + 1) % conceptCount]}.`,
      commonMisconception: `Confundir "${kw}" con un detalle aislado en lugar de ver su papel dentro de la idea general.`,
      keyPoints: [
        `Concepto eje: ${kw}`,
        shorten(sentence, 85),
      ],
      connectsTo: nextIds,
    };
  });

  const quiz = buildLocalQuizQuestions({
    sourceTextContext: text,
    existingQuestions: [],
    neededCount: 10,
  });

  const matchPairs = Array.from({ length: 6 }, (_, idx) => ({
    id: `mp-${idx + 1}`,
    term: shorten(safeKeywords[idx], 28),
    definition: shorten(safeSentences[idx], 85),
    category: stageNames[idx % stageNames.length],
  }));

  const sequenceChallenge = {
    title: `Ruta lógica de ${shorten(titleFromFile, 35)}`,
    instruction: 'Ordena las ideas siguiendo la progresión del documento.',
    steps: Array.from({ length: 4 }, (_, idx) => ({
      id: `seq-${idx + 1}`,
      order: idx + 1,
      title: `${idx + 1}. ${safeKeywords[idx]}`,
      description: shorten(safeSentences[idx], 110),
    })),
  };

  const clozeExercises = Array.from({ length: 4 }, (_, idx) => {
    const s = safeSentences[idx];
    const kw = safeKeywords[idx];
    const regex = new RegExp(`\\b(${kw})\\b`, 'i');
    const match = s.match(regex);
    if (match && match.index !== undefined) {
      return {
        id: `cl-${idx + 1}`,
        beforeBlank: s.slice(0, match.index).trim(),
        blankAnswer: match[1],
        afterBlank: s.slice(match.index + match[1].length).trim(),
        hint: `Empieza por "${match[1].slice(0, 2)}..."`,
      };
    }
    return {
      id: `cl-${idx + 1}`,
      beforeBlank: `Un concepto fundamental del documento es`,
      blankAnswer: kw,
      afterBlank: `porque organiza esta parte del tema.`,
      hint: `Tiene ${kw.length} letras y empieza con "${kw[0]}"`,
    };
  });

  const trueFalseItems = Array.from({ length: 8 }, (_, idx) => {
    const isTrue = idx % 2 === 0;
    const s = safeSentences[idx % safeSentences.length];
    const kw = safeKeywords[idx % safeKeywords.length];
    const altKw = safeKeywords[(idx + 3) % safeKeywords.length];
    return {
      id: `tf-${idx + 1}`,
      statement: isTrue
        ? shorten(s, 140)
        : `El documento afirma que ${kw.toLowerCase()} es exactamente lo opuesto e incompatible con ${altKw.toLowerCase()}.`,
      isTrue,
      explanation: isTrue
        ? `Correcto: esta afirmación aparece respaldada en el material subido.`
        : `Falso: el material conecta ${kw} de manera constructiva con la idea principal (${shorten(s, 90)}).`,
    };
  });

  const categories = [
    { id: 'cat1', name: `Bases: ${safeKeywords[0]}` },
    { id: 'cat2', name: `Proceso: ${safeKeywords[1]}` },
    { id: 'cat3', name: `Aplicación: ${safeKeywords[2]}` },
  ];

  const categorySortGame = {
    title: `Clasificador de ${shorten(titleFromFile, 32)}`,
    instruction: 'Agrupa cada idea o término según su función en el tema.',
    categories,
    items: Array.from({ length: 9 }, (_, idx) => {
      const cat = categories[idx % 3];
      return {
        id: `cs-${idx + 1}`,
        label: shorten(`${safeKeywords[idx % safeKeywords.length]}: ${safeSentences[idx % safeSentences.length]}`, 60),
        categoryId: cat.id,
        hint: `Relacionado con ${cat.name}`,
      };
    }),
  };

  const flashcards = Array.from({ length: 6 }, (_, idx) => ({
    id: `fc-${idx + 1}`,
    front: `¿Qué papel cumple "${safeKeywords[idx]}" en este tema?`,
    back: shorten(safeSentences[idx], 160),
    analogy: `Imagínalo como el engranaje "${safeKeywords[idx]}" que mantiene el tema conectado.`,
    hint: `Revisa la etapa ${Math.min(4, idx + 1)} del mapa visual.`,
  }));

  return {
    id: `kit-${Date.now()}`,
    sourceFileName: params.fileName,
    sourceType: params.sourceType,
    sourceTextContext: text.slice(0, 28000),
    subjectTitle: titleFromFile,
    discipline: 'Documento de Estudio',
    level: params.level,
    focus: params.focus,
    estimatedStudyMinutes: Math.max(10, Math.min(45, Math.round(text.length / 450) + 10)),
    executiveSummary: shorten(safeSentences.slice(0, 3).join(' '), 320),
    bigIdea: shorten(safeSentences[0], 160),
    stages,
    concepts,
    quiz,
    matchPairs,
    sequenceChallenge,
    clozeExercises,
    trueFalseItems,
    categorySortGame,
    flashcards,
    feynmanGuide: {
      childLevelExplanation: `En palabras simples, "${titleFromFile}" trata sobre cómo ${safeKeywords.slice(0, 3).join(', ')} trabajan juntos: ${shorten(safeSentences[0], 160)}`,
      socraticQuestions: [
        `¿Qué pasaría si quitamos "${safeKeywords[0]}" del proceso?`,
        `¿Cómo explicarías "${safeKeywords[1]}" usando un ejemplo de tu vida diaria?`,
        `¿Qué relación ves entre "${safeKeywords[0]}" y "${safeKeywords[2]}"?`,
      ],
      realWorldHook: shorten(safeSentences[1] || safeSentences[0], 170),
    },
    teachingMethods: [
      {
        id: 'tm-1',
        name: 'Carrera de Conceptos en Equipo',
        durationMinutes: 15,
        bestFor: 'Repaso activo en clase',
        objective: `Dominar ${safeKeywords.slice(0, 4).join(', ')} sin memorización mecánica.`,
        steps: [
          'Divide al grupo en equipos de 3 o 4 personas.',
          'Asigna a cada equipo una tarjeta del mapa conceptual para explicarla en 60 segundos.',
          'El resto del grupo valida si se incluyó el ejemplo correcto del documento.',
        ],
        materialsNeeded: ['Pizarrón o tarjetas de papel', 'Temporizador de 1 minuto'],
      },
      {
        id: 'tm-2',
        name: 'Mito vs. Realidad en Voz Alta',
        durationMinutes: 10,
        bestFor: 'Corregir confusiones frecuentes',
        objective: 'Detectar errores típicos mediante debate rápido.',
        steps: [
          'Lee una de las afirmaciones de Verdadero o Falso.',
          'Los estudiantes levantan mano derecha (Verdadero) o izquierda (Falso).',
          'Dos voluntarios justifican su respuesta usando el documento.',
        ],
        materialsNeeded: ['Ninguno (solo voz y participación)'],
      },
    ],
    lessonPlanActs: [
      {
        actNumber: 1,
        title: 'Inicio y Gancho',
        durationMinutes: 10,
        teacherAction: `Presentar la gran idea: "${shorten(safeSentences[0], 110)}"`,
        studentActivity: 'Responder qué saben o imaginan del tema en 1 frase.',
      },
      {
        actNumber: 2,
        title: 'Exploración Activa con Juegos',
        durationMinutes: 25,
        teacherAction: 'Guiar el recorrido por el Mapa Visual y lanzar Trivia o Clasificador.',
        studentActivity: 'Resolver en parejas la Trivia y las parejas de memoria.',
      },
      {
        actNumber: 3,
        title: 'Cierre y Consolidación',
        durationMinutes: 10,
        teacherAction: 'Aplicar las preguntas de salida y aclarar dudas finales.',
        studentActivity: 'Escribir con sus propias palabras 1 concepto aprendido.',
      },
    ],
    exitTicketQuestions: [
      `Explica en una frase qué hace "${safeKeywords[0]}" dentro de este tema.`,
      `¿Cuál fue la conexión más importante que descubriste hoy en "${titleFromFile}"?`,
    ],
  };
}
