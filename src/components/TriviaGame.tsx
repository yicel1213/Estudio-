import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Timer,
  Flame,
  ArrowRight,
  Trophy,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { DidacticKit, QuizQuestion } from '../types/didactic';

interface TriviaGameProps {
  kit: DidacticKit;
  onFinishQuiz: (score: number, total: number) => void;
  onQuestionsExpanded: (newQuestions: QuizQuestion[]) => void;
}

const DIFFICULTY_TEXT: Record<string, string> = {
  basico: 'Nivel básico',
  intermedio: 'Nivel intermedio',
  reto: 'Nivel reto',
};

const COUNT_OPTIONS = [10, 20, 30] as const;

export const TriviaGame: React.FC<TriviaGameProps> = ({
  kit,
  onFinishQuiz,
  onQuestionsExpanded,
}) => {
  const [targetCount, setTargetCount] = useState<number>(10);
  const [isExpanding, setIsExpanding] = useState(false);
  const [expandError, setExpandError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [useTimer, setUseTimer] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25);
  const [answersLog, setAnswersLog] = useState<Array<{ qId: string; correct: boolean }>>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const activeQuestions = kit.quiz.slice(0, Math.min(targetCount, kit.quiz.length));
  const currentQuestion = activeQuestions[currentIndex];
  const hasAnswered = selectedOption !== null;

  const resetProgress = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setSecondsLeft(25);
    setAnswersLog([]);
    setIsCompleted(false);
  };

  useEffect(() => {
    resetProgress();
    setTargetCount(10);
    setExpandError(null);
  }, [kit.id]);

  useEffect(() => {
    if (!useTimer || hasAnswered || isCompleted || !currentQuestion || isExpanding) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setSelectedOption(-1);
          setStreak(0);
          setAnswersLog((log) => [...log, { qId: currentQuestion.id, correct: false }]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [useTimer, hasAnswered, isCompleted, currentQuestion, isExpanding]);

  const handleSelectCount = async (count: number) => {
    setExpandError(null);
    setTargetCount(count);
    resetProgress();

    if (kit.quiz.length >= count) {
      return;
    }

    // Request remaining questions from server
    const needed = count - kit.quiz.length;
    setIsExpanding(true);
    try {
      const contextFallback =
        kit.sourceTextContext ||
        `${kit.executiveSummary}\n${kit.concepts
          .map((c) => `${c.title}: ${c.simpleExplanation} ${c.documentExample}`)
          .join('\n')}`;

      const response = await fetch('/api/expand-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectTitle: kit.subjectTitle,
          discipline: kit.discipline,
          level: kit.level,
          sourceTextContext: contextFallback,
          existingQuestions: kit.quiz.map((q) => q.question),
          neededCount: needed,
        }),
      });

      const raw = await response.text();
      const data = raw ? JSON.parse(raw) : {};
      if (!response.ok) {
        throw new Error(data?.error || 'No se pudieron generar más preguntas.');
      }
      if (Array.isArray(data?.questions) && data.questions.length > 0) {
        onQuestionsExpanded(data.questions as QuizQuestion[]);
      }
    } catch (err) {
      setExpandError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar las preguntas adicionales.'
      );
      setTargetCount(Math.min(10, kit.quiz.length) || 10);
    } finally {
      setIsExpanding(false);
    }
  };

  const handleSelectOption = (optionIdx: number) => {
    if (hasAnswered || !currentQuestion) return;
    setSelectedOption(optionIdx);
    const isCorrect = optionIdx === currentQuestion.correctIndex;
    if (isCorrect) {
      const nextStreak = streak + 1;
      setScore((s) => s + 1);
      setStreak(nextStreak);
      setBestStreak((b) => Math.max(b, nextStreak));
    } else {
      setStreak(0);
    }
    setAnswersLog((log) => [...log, { qId: currentQuestion.id, correct: isCorrect }]);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= activeQuestions.length) {
      setIsCompleted(true);
      onFinishQuiz(score, activeQuestions.length);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setSecondsLeft(25);
    }
  };

  if (kit.quiz.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-600">
        Este material no generó preguntas de trivia todavía.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Top Bar: Question Count Selector (10 / 20 / 30) + Timer & Reset */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-600">Cantidad de preguntas:</span>
            <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {COUNT_OPTIONS.map((count) => {
                const active = targetCount === count;
                return (
                  <button
                    key={count}
                    type="button"
                    disabled={isExpanding}
                    onClick={() => handleSelectCount(count)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer tabular-nums whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-700 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    {count} preguntas
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setUseTimer((t) => !t);
                setSecondsLeft(25);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                useTimer
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              <span>{useTimer ? `Reloj: ${secondsLeft}s` : 'Activar reloj (25s)'}</span>
            </button>

            <button
              type="button"
              onClick={resetProgress}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm border-t border-slate-100 pt-3">
          <span className="font-semibold text-slate-900 tabular-nums">
            Pregunta {Math.min(currentIndex + 1, activeQuestions.length)} de {activeQuestions.length}
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="text-slate-600 font-medium tabular-nums">
            Aciertos: <strong className="text-slate-900">{score}</strong>
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="inline-flex items-center gap-1 text-amber-700 font-medium tabular-nums">
            <Flame className="w-4 h-4" />
            Racha: {streak}
          </span>
        </div>
      </div>

      {expandError && (
        <div
          role="alert"
          className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{expandError}</span>
        </div>
      )}

      {isExpanding ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto" />
          <h3 className="font-display text-lg font-bold text-slate-900">
            Preparando tu trivia de {targetCount} preguntas...
          </h3>
          <p className="text-sm text-slate-600">
            Creando preguntas nuevas basadas en tu materia sin repetir las anteriores.
          </p>
        </div>
      ) : isCompleted ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-slate-900">
                  Resultado de Trivia ({activeQuestions.length} preguntas)
                </h3>
                <p className="text-sm text-slate-600">
                  Has completado el desafío sobre {kit.subjectTitle}.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={resetProgress}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Jugar de nuevo</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-500 font-medium">Aciertos</p>
              <p className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-1">
                {score} / {activeQuestions.length}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-500 font-medium">Precisión</p>
              <p className="font-display text-2xl font-bold text-emerald-700 tabular-nums mt-1">
                {Math.round((score / activeQuestions.length) * 100)}%
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-500 font-medium">Mejor racha</p>
              <p className="font-display text-2xl font-bold text-amber-600 tabular-nums mt-1">
                {bestStreak} seguidas
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold text-slate-900">
              Repaso rápido de tus respuestas
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg max-h-[420px] overflow-y-auto">
              {activeQuestions.map((q, idx) => {
                const entry = answersLog[idx];
                const ok = entry?.correct;
                return (
                  <div key={q.id} className="p-4 flex items-start gap-3">
                    {ok ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {idx + 1}. {q.question}
                      </p>
                      <p className="text-xs text-emerald-800 font-medium">
                        Respuesta correcta: {q.options[q.correctIndex]}
                      </p>
                      <p className="text-xs text-slate-600">{q.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : currentQuestion ? (
        <>
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-600 transition-transform duration-200 origin-left"
              style={{
                transform: `scaleX(${
                  (currentIndex + (hasAnswered ? 1 : 0)) / activeQuestions.length
                })`,
              }}
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500">
                {DIFFICULTY_TEXT[currentQuestion.difficulty] || 'Pregunta'}
              </p>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {currentQuestion.question}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((opt, idx) => {
                const letter = ['A', 'B', 'C', 'D'][idx];
                const isChosen = selectedOption === idx;
                const isCorrect = idx === currentQuestion.correctIndex;

                let btnStyle =
                  'bg-slate-50 border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 text-slate-800';
                if (hasAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950';
                  } else if (isChosen && !isCorrect) {
                    btnStyle = 'bg-red-50 border-red-400 text-red-950';
                  } else {
                    btnStyle = 'bg-slate-50 border-slate-200 text-slate-400';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={hasAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-colors flex items-center justify-between gap-3 ${
                      hasAnswered ? 'cursor-default' : 'cursor-pointer'
                    } ${btnStyle}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-md bg-white border border-slate-200 text-xs font-mono font-semibold flex items-center justify-center shrink-0 mt-0.5 text-slate-700">
                        {letter}
                      </span>
                      <span className="text-sm sm:text-base font-medium leading-snug">{opt}</span>
                    </div>

                    {hasAnswered && isCorrect && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                        Correcta
                      </span>
                    )}
                    {hasAnswered && isChosen && !isCorrect && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 shrink-0">
                        <XCircle className="w-4 h-4" />
                        Incorrecta
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {hasAnswered && (
              <div
                className={`p-4 rounded-xl border space-y-2 ${
                  selectedOption === currentQuestion.correctIndex
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50/70 border-amber-200 text-slate-900'
                }`}
              >
                <span className="text-xs font-bold block">
                  {selectedOption === -1
                    ? 'Se acabó el tiempo · Aclaración:'
                    : selectedOption === currentQuestion.correctIndex
                    ? '¡Excelente! Por qué es correcta:'
                    : 'Aclaración didáctica:'}
                </span>
                <p className="text-sm leading-relaxed">{currentQuestion.explanation}</p>
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>
                      {currentIndex + 1 >= activeQuestions.length
                        ? 'Ver resultado final'
                        : 'Siguiente pregunta'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};
