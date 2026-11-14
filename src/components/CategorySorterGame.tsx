import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  HelpCircle,
  Trophy,
  FolderKanban,
} from 'lucide-react';
import { CategorySortItem, DidacticKit } from '../types/didactic';

interface CategorySorterGameProps {
  kit: DidacticKit;
  onSolved: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const CategorySorterGame: React.FC<CategorySorterGameProps> = ({
  kit,
  onSolved,
}) => {
  const challenge = kit.categorySortGame;
  const [shuffledItems, setShuffledItems] = useState<CategorySortItem[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [showHintId, setShowHintId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ itemId: string; ok: boolean; msg: string } | null>(
    null
  );

  const resetGame = () => {
    setShuffledItems(shuffle(challenge?.items || []));
    setAssignments({});
    setShowHintId(null);
    setFeedback(null);
  };

  useEffect(() => {
    resetGame();
  }, [kit.id]);

  const remainingItems = useMemo(
    () => shuffledItems.filter((it) => !assignments[it.id]),
    [shuffledItems, assignments]
  );

  const currentItem = remainingItems[0];
  const totalItems = shuffledItems.length;
  const solvedCount = Object.keys(assignments).length;

  const handleAssign = (categoryId: string) => {
    if (!currentItem) return;
    const isMatch = currentItem.categoryId === categoryId;
    const targetCat = challenge.categories.find((c) => c.id === categoryId);

    if (isMatch) {
      const next = { ...assignments, [currentItem.id]: categoryId };
      setAssignments(next);
      setFeedback({
        itemId: currentItem.id,
        ok: true,
        msg: `¡Exacto! "${currentItem.label}" pertenece a ${targetCat?.name || 'esa categoría'}.`,
      });
      setShowHintId(null);
      if (Object.keys(next).length === totalItems) {
        onSolved();
      }
    } else {
      setFeedback({
        itemId: currentItem.id,
        ok: false,
        msg: `No encaja en ${targetCat?.name || 'esa categoría'}. Pista: ${currentItem.hint}`,
      });
    }
  };

  if (!challenge || challenge.categories.length === 0 || challenge.items.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-600">
        No hay categorías disponibles para este material.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900">{challenge.title}</h3>
          <p className="text-sm text-slate-600 mt-0.5">{challenge.instruction}</p>
        </div>

        <div className="flex items-center gap-4 text-sm shrink-0">
          <span className="text-slate-600 font-medium tabular-nums">
            Clasificados: <strong className="text-slate-900">{solvedCount} / {totalItems}</strong>
          </span>
          <button
            type="button"
            onClick={resetGame}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar</span>
          </button>
        </div>
      </div>

      {/* Active Item Card or Completion */}
      {currentItem ? (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-xl p-6 text-center space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Elemento actual a clasificar</span>
            <span className="tabular-nums">Faltan {remainingItems.length}</span>
          </div>

          <p className="font-display text-2xl font-bold text-slate-900 py-2">
            {currentItem.label}
          </p>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() =>
                setShowHintId((prev) => (prev === currentItem.id ? null : currentItem.id))
              }
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-sky-700 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>
                {showHintId === currentItem.id ? currentItem.hint : 'Ver pista del elemento'}
              </span>
            </button>
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-lg border text-xs sm:text-sm font-medium flex items-center justify-center gap-2 ${
                feedback.ok
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              {feedback.ok ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <XCircle className="w-4 h-4 shrink-0 text-amber-700" />
              )}
              <span>{feedback.msg}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-7 h-7 text-emerald-700 shrink-0" />
            <div>
              <h4 className="font-display text-lg font-bold text-emerald-950">
                ¡Todos los conceptos clasificados correctamente!
              </h4>
              <p className="text-sm text-emerald-800">
                Dominaste las {challenge.categories.length} categorías clave de {kit.subjectTitle}.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetGame}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mezclar y jugar otra vez</span>
          </button>
        </div>
      )}

      {/* Category Buckets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {challenge.categories.map((cat) => {
          const itemsInBucket = shuffledItems.filter((it) => assignments[it.id] === cat.id);
          return (
            <div
              key={cat.id}
              className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-sky-600 shrink-0" />
                    <h4 className="font-display font-bold text-base text-slate-900">
                      {cat.name}
                    </h4>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 tabular-nums">
                    {itemsInBucket.length}
                  </span>
                </div>

                {currentItem && (
                  <button
                    type="button"
                    onClick={() => handleAssign(cat.id)}
                    className="w-full py-2.5 px-3 rounded-lg bg-sky-50 hover:bg-sky-600 text-sky-800 hover:text-white border border-sky-200 hover:border-sky-600 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Colocar aquí
                  </button>
                )}

                <div className="space-y-2 pt-1">
                  {itemsInBucket.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-3 text-center border border-dashed border-slate-200 rounded-lg">
                      Aún vacío
                    </p>
                  ) : (
                    itemsInBucket.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs font-semibold text-emerald-950 flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
