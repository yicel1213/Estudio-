import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Flame,
  RotateCcw,
  ArrowRight,
  Trophy,
} from 'lucide-react';
import { DidacticKit } from '../types/didactic';

interface TrueFalseGameProps {
  kit: DidacticKit;
  onFinish: (score: number, total: number) => void;
}

export const TrueFalseGame: React.FC<TrueFalseGameProps> = ({ kit, onFinish }) => {
  const items = kit.trueFalseItems || [];
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);

  const current = items[index];
  const answered = picked !== null;

  const reset = () => {
    setIndex(0);
    setPicked(null);
    setScore(0);
    setStreak(0);
    setResults([]);
    setDone(false);
  };

  useEffect(() => {
    reset();
  }, [kit.id]);

  const handleAnswer = (val: boolean) => {
    if (answered || !current) return;
    setPicked(val);
    const ok = val === current.isTrue;
    if (ok) {
      setScore((s) => s + 1);
      setStreak((st) => st + 1);
    } else {
      setStreak(0);
    }
    setResults((r) => [...r, ok]);
  };

  const handleNext = () => {
    if (index + 1 >= items.length) {
      setDone(true);
      onFinish(score, items.length);
    } else {
      setIndex((i) => i + 1);
      setPicked(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-600">
        No hay afirmaciones de Verdadero o Falso disponibles para este tema.
      </div>
    );
  }

  if (done) {
    const pct = Math.round((score / items.length) * 100);
    return (
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-xl p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold text-slate-900">
                Mito vs. Realidad Completado
              </h3>
              <p className="text-sm text-slate-600 tabular-nums">
                Acertaste {score} de {items.length} afirmaciones ({pct}%).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Jugar de nuevo</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
          {items.map((item, i) => (
            <div key={item.id} className="p-4 flex items-start gap-3">
              {results[i] ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">{item.statement}</p>
                <p className="text-xs font-semibold text-sky-700">
                  Respuesta real: {item.isTrue ? 'Verdadero' : 'Falso'}
                </p>
                <p className="text-xs text-slate-600">{item.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isCorrect = answered && picked === current.isTrue;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-sm">
          <span className="font-semibold text-slate-900 tabular-nums">
            Afirmación {index + 1} de {items.length}
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

        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reiniciar</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="space-y-2 text-center">
          <span className="text-xs font-semibold text-sky-700">¿Mito o Realidad?</span>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 leading-snug text-balance">
            {current.statement}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            disabled={answered}
            onClick={() => handleAnswer(true)}
            className={`p-5 rounded-xl border text-center font-display text-lg font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 ${
              answered
                ? current.isTrue
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                  : picked === true
                  ? 'bg-red-50 border-red-400 text-red-900'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
                : 'bg-slate-50 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Verdadero</span>
          </button>

          <button
            type="button"
            disabled={answered}
            onClick={() => handleAnswer(false)}
            className={`p-5 rounded-xl border text-center font-display text-lg font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 ${
              answered
                ? !current.isTrue
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                  : picked === false
                  ? 'bg-red-50 border-red-400 text-red-900'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
                : 'bg-slate-50 border-slate-200 hover:border-red-400 hover:bg-red-50/50 text-slate-900'
            }`}
          >
            <XCircle className="w-5 h-5 text-red-600" />
            <span>Falso</span>
          </button>
        </div>

        {answered && (
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              isCorrect
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-amber-50/70 border-amber-200 text-slate-900'
            }`}
          >
            <p className="text-xs font-bold">
              {isCorrect ? '¡Correcto!' : '¡Ojo con este detalle!'}
            </p>
            <p className="text-sm leading-relaxed">{current.explanation}</p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold cursor-pointer"
              >
                <span>{index + 1 >= items.length ? 'Ver resumen' : 'Siguiente'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
