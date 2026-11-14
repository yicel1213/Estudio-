import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  RotateCcw,
  HelpCircle,
} from 'lucide-react';
import { DidacticKit, SequenceStep } from '../types/didactic';

interface SequenceClozeGameProps {
  kit: DidacticKit;
  onSequenceSolved: () => void;
  onClozeSolvedCount: (count: number) => void;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const SequenceClozeGame: React.FC<SequenceClozeGameProps> = ({
  kit,
  onSequenceSolved,
  onClozeSolvedCount,
}) => {
  // --- Part A: Sequence Ordering ---
  const originalSteps = useMemo(
    () => [...kit.sequenceChallenge.steps].sort((a, b) => a.order - b.order),
    [kit.sequenceChallenge.steps]
  );
  const [orderedSteps, setOrderedSteps] = useState<SequenceStep[]>([]);
  const [sequenceChecked, setSequenceChecked] = useState(false);

  // --- Part B: Cloze Completion ---
  const [clozeUserAnswers, setClozeUserAnswers] = useState<Record<string, string>>({});
  const [activeClozeId, setActiveClozeId] = useState<string | null>(
    kit.clozeExercises[0]?.id || null
  );
  const [showClozeHints, setShowClozeHints] = useState<Record<string, boolean>>({});
  const [clozeChecked, setClozeChecked] = useState(false);

  const resetSequence = () => {
    let scrambled = shuffle(originalSteps);
    if (
      originalSteps.length > 1 &&
      scrambled.every((s, idx) => s.id === originalSteps[idx].id)
    ) {
      scrambled = [...scrambled.slice(1), scrambled[0]];
    }
    setOrderedSteps(scrambled);
    setSequenceChecked(false);
  };

  useEffect(() => {
    resetSequence();
    setClozeUserAnswers({});
    setActiveClozeId(kit.clozeExercises[0]?.id || null);
    setShowClozeHints({});
    setClozeChecked(false);
  }, [kit.id]);

  const moveStep = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= orderedSteps.length) return;
    const copy = [...orderedSteps];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    setOrderedSteps(copy);
    setSequenceChecked(false);
  };

  const handleCheckSequence = () => {
    setSequenceChecked(true);
    const allRight = orderedSteps.every((step, idx) => step.order === idx + 1);
    if (allRight) {
      onSequenceSolved();
    }
  };

  const wordBank = useMemo(
    () => shuffle(kit.clozeExercises.map((c) => c.blankAnswer)),
    [kit.clozeExercises, kit.id]
  );

  const handlePickWord = (word: string) => {
    if (!activeClozeId) return;
    setClozeUserAnswers((prev) => ({ ...prev, [activeClozeId]: word }));
    setClozeChecked(false);

    // Automatically advance to next unanswered blank
    const currentIdx = kit.clozeExercises.findIndex((c) => c.id === activeClozeId);
    const nextUnfilled = kit.clozeExercises.find(
      (c, idx) => idx > currentIdx && !clozeUserAnswers[c.id]
    );
    if (nextUnfilled) {
      setActiveClozeId(nextUnfilled.id);
    }
  };

  const handleCheckCloze = () => {
    setClozeChecked(true);
    const solved = kit.clozeExercises.filter(
      (c) =>
        (clozeUserAnswers[c.id] || '').trim().toLowerCase() ===
        c.blankAnswer.trim().toLowerCase()
    ).length;
    onClozeSolvedCount(solved);
  };

  const isSequencePerfect =
    sequenceChecked && orderedSteps.every((step, idx) => step.order === idx + 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left: Sequence Ordering Challenge */}
      <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-sky-700">Reto 1 · Secuencia lógica</span>
            <h3 className="font-display text-xl font-bold text-slate-900 mt-0.5">
              {kit.sequenceChallenge.title}
            </h3>
            <p className="text-sm text-slate-600 mt-1">{kit.sequenceChallenge.instruction}</p>
          </div>
          <button
            type="button"
            onClick={resetSequence}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mezclar</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {orderedSteps.map((step, idx) => {
            const isCorrectPos = sequenceChecked && step.order === idx + 1;
            const isWrongPos = sequenceChecked && step.order !== idx + 1;

            return (
              <div
                key={step.id}
                className={`p-4 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                  isCorrectPos
                    ? 'bg-emerald-50 border-emerald-400'
                    : isWrongPos
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-md bg-white border border-slate-200 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 text-slate-700 tabular-nums">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-display font-semibold text-sm text-slate-900">
                      {step.title}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {step.description}
                    </p>
                    {sequenceChecked && (
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold mt-1.5 ${
                          isCorrectPos ? 'text-emerald-700' : 'text-amber-800'
                        }`}
                      >
                        {isCorrectPos ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Posición correcta
                          </>
                        ) : (
                          <>Debe ir en otra posición</>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveStep(idx, -1)}
                    aria-label={`Subir paso ${step.title}`}
                    className="w-8 h-8 rounded-md bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-35 flex items-center justify-center text-slate-700 cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === orderedSteps.length - 1}
                    onClick={() => moveStep(idx, 1)}
                    aria-label={`Bajar paso ${step.title}`}
                    className="w-8 h-8 rounded-md bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-35 flex items-center justify-center text-slate-700 cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleCheckSequence}
            className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Comprobar orden
          </button>

          {isSequencePerfect && (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              ¡Secuencia perfecta!
            </span>
          )}
        </div>
      </div>

      {/* Right: Cloze Word-Bank Completion */}
      <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-emerald-700">
              Reto 2 · Completa la idea clave
            </span>
            <h3 className="font-display text-xl font-bold text-slate-900 mt-0.5">
              Banco de Palabras Activo
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Elige un espacio en blanco y selecciona el término correcto del banco.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setClozeUserAnswers({});
              setClozeChecked(false);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpiar</span>
          </button>
        </div>

        {/* Word Bank */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <p className="text-xs font-semibold text-slate-500">Banco de términos disponibles</p>
          <div className="flex flex-wrap gap-2">
            {wordBank.map((word, idx) => {
              const alreadyUsed = Object.values(clozeUserAnswers).includes(word);
              return (
                <button
                  key={`${word}-${idx}`}
                  type="button"
                  onClick={() => handlePickWord(word)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    alreadyUsed
                      ? 'bg-slate-200 border-slate-300 text-slate-500'
                      : 'bg-white border-slate-300 hover:border-sky-600 hover:text-sky-800 text-slate-900'
                  }`}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cloze Sentences */}
        <div className="space-y-3">
          {kit.clozeExercises.map((item, idx) => {
            const val = clozeUserAnswers[item.id] || '';
            const isActive = activeClozeId === item.id;
            const isCorrect =
              clozeChecked &&
              val.trim().toLowerCase() === item.blankAnswer.trim().toLowerCase();
            const isWrong = clozeChecked && !isCorrect;

            return (
              <div
                key={item.id}
                onClick={() => setActiveClozeId(item.id)}
                className={`p-4 rounded-xl border transition-colors cursor-pointer space-y-2 ${
                  isCorrect
                    ? 'bg-emerald-50/70 border-emerald-400'
                    : isWrong
                    ? 'bg-red-50/60 border-red-300'
                    : isActive
                    ? 'bg-sky-50/60 border-sky-500'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className="text-sm text-slate-800 leading-relaxed">
                  <span className="font-mono text-xs text-slate-400 mr-2">{idx + 1}.</span>
                  {item.beforeBlank}{' '}
                  <span
                    className={`inline-block min-w-[100px] px-2.5 py-0.5 mx-1 rounded-md border text-center font-semibold ${
                      val
                        ? isCorrect
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                          : isWrong
                          ? 'bg-red-100 border-red-400 text-red-900'
                          : 'bg-white border-sky-500 text-sky-900'
                        : 'bg-slate-100 border-dashed border-slate-400 text-slate-400'
                    }`}
                  >
                    {val || '________'}
                  </span>{' '}
                  {item.afterBlank}
                </p>

                <div className="flex items-center justify-between gap-2 text-xs">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowClozeHints((prev) => ({ ...prev, [item.id]: !prev[item.id] }));
                    }}
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-sky-700 font-medium cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showClozeHints[item.id] ? item.hint : 'Ver pista'}</span>
                  </button>

                  {isWrong && (
                    <span className="inline-flex items-center gap-1 text-red-700 font-semibold">
                      <XCircle className="w-3.5 h-3.5" />
                      Correcta: {item.blankAnswer}
                    </span>
                  )}
                  {isCorrect && (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Exacto
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleCheckCloze}
          className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          Verificar respuestas
        </button>
      </div>
    </div>
  );
};
