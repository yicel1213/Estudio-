import React, { useEffect, useState } from 'react';
import {
  RotateCw,
  HelpCircle,
  CheckCircle2,
  RefreshCw,
  ThumbsUp,
  RotateCcw,
} from 'lucide-react';
import { DidacticKit, FlashcardItem } from '../types/didactic';

interface FlashcardsDeckProps {
  kit: DidacticKit;
  masteredIds: string[];
  onMarkMastered: (id: string) => void;
}

export const FlashcardsDeck: React.FC<FlashcardsDeckProps> = ({
  kit,
  masteredIds,
  onMarkMastered,
}) => {
  const [queue, setQueue] = useState<FlashcardItem[]>(kit.flashcards);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setQueue(kit.flashcards);
    setIsFlipped(false);
    setShowHint(false);
  }, [kit.id]);

  const currentCard = queue[0];

  const handleGrade = (rating: 'hard' | 'unsure' | 'mastered') => {
    if (!currentCard) return;
    setIsFlipped(false);
    setShowHint(false);

    if (rating === 'mastered') {
      onMarkMastered(currentCard.id);
      setQueue((prev) => prev.slice(1));
    } else if (rating === 'unsure') {
      // Requeue 2 positions later
      setQueue((prev) => {
        const rest = prev.slice(1);
        const insertAt = Math.min(2, rest.length);
        return [...rest.slice(0, insertAt), currentCard, ...rest.slice(insertAt)];
      });
    } else {
      // Requeue at end of active deck
      setQueue((prev) => [...prev.slice(1), currentCard]);
    }
  };

  const handleResetDeck = () => {
    setQueue(kit.flashcards);
    setIsFlipped(false);
    setShowHint(false);
  };

  if (kit.flashcards.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-600">
        No hay tarjetas disponibles para este tema.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="text-sm text-slate-600 tabular-nums">
          Dominadas:{' '}
          <strong className="text-slate-900">
            {masteredIds.length} / {kit.flashcards.length}
          </strong>
          <span aria-hidden="true" className="mx-2 text-slate-300">·</span>
          En mazo actual: <strong className="text-slate-900">{queue.length}</strong>
        </div>

        <button
          type="button"
          onClick={handleResetDeck}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer whitespace-nowrap shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reiniciar mazo</span>
        </button>
      </div>

      {currentCard ? (
        <>
          {/* 3D Flip Card */}
          <div className="perspective-1000">
            <div
              onClick={() => setIsFlipped((f) => !f)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsFlipped((f) => !f);
                }
              }}
              className={`relative w-full min-h-[300px] preserve-3d transition-transform duration-300 cursor-pointer ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* Front Side */}
              <div className="absolute inset-0 backface-hidden bg-white border border-slate-200 rounded-xl p-8 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Pregunta / Concepto</span>
                  <span className="inline-flex items-center gap-1 text-sky-700 font-semibold">
                    <RotateCw className="w-3.5 h-3.5" />
                    Toca para voltear
                  </span>
                </div>

                <div className="py-4 text-center space-y-4">
                  <h3 className="font-display text-2xl font-bold text-slate-900 leading-snug text-balance">
                    {currentCard.front}
                  </h3>

                  {showHint && (
                    <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 inline-block">
                      Pista: {currentCard.hint}
                    </p>
                  )}
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowHint((h) => !h);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-sky-700 cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>{showHint ? 'Ocultar pista' : 'Necesito una pista'}</span>
                  </button>
                </div>
              </div>

              {/* Back Side */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col justify-between text-white">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>Respuesta clara</span>
                  <span className="inline-flex items-center gap-1 text-sky-300 font-semibold">
                    <RotateCw className="w-3.5 h-3.5" />
                    Ver pregunta
                  </span>
                </div>

                <div className="space-y-4 py-3">
                  <p className="text-lg sm:text-xl font-medium leading-relaxed text-white">
                    {currentCard.back}
                  </p>
                  <div className="p-3.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-sky-200">
                    <strong className="text-white">Truco para recordarlo:</strong> {currentCard.analogy}
                  </div>
                </div>

                <p className="text-xs text-slate-400 text-center">
                  Elige abajo qué tan bien recordaste esta tarjeta.
                </p>
              </div>
            </div>
          </div>

          {/* Spaced Repetition Grading Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleGrade('hard')}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white border border-red-200 hover:bg-red-50 text-red-700 text-sm font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Me costó (repetir)</span>
            </button>
            <button
              type="button"
              onClick={() => handleGrade('unsure')}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white border border-amber-200 hover:bg-amber-50 text-amber-800 text-sm font-semibold transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Lo dudé un poco</span>
            </button>
            <button
              type="button"
              onClick={() => handleGrade('mastered')}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>¡Dominado!</span>
            </button>
          </div>
        </>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-display text-2xl font-bold text-slate-900">
            ¡Mazo 100% dominado!
          </h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Repasaste y aprobaste todas las tarjetas activas de {kit.subjectTitle}.
          </p>
          <button
            type="button"
            onClick={handleResetDeck}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Practicar de nuevo</span>
          </button>
        </div>
      )}
    </div>
  );
};
