import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, RotateCcw, Shuffle, Trophy, Sparkles } from 'lucide-react';
import { DidacticKit, MatchPair } from '../types/didactic';

interface MatchMemoryGameProps {
  kit: DidacticKit;
  onSolved: () => void;
}

interface MemoryCard {
  uid: string;
  pairId: string;
  side: 'term' | 'definition';
  text: string;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const MatchMemoryGame: React.FC<MatchMemoryGameProps> = ({ kit, onSolved }) => {
  const pairs = kit.matchPairs;
  const [mode, setMode] = useState<'connect' | 'memory'>('connect');

  // --- Connect Mode State ---
  const [shuffledRight, setShuffledRight] = useState<MatchPair[]>([]);
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongPairFlash, setWrongPairFlash] = useState<{ left: string; right: string } | null>(null);
  const [connectAttempts, setConnectAttempts] = useState(0);

  // --- Memory Mode State ---
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [memoryMatchedPairIds, setMemoryMatchedPairIds] = useState<string[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [isCheckingMemory, setIsCheckingMemory] = useState(false);

  const initBoards = () => {
    setShuffledRight(shuffleArray(pairs));
    setSelectedLeftId(null);
    setMatchedIds([]);
    setWrongPairFlash(null);
    setConnectAttempts(0);

    const deck: MemoryCard[] = [];
    pairs.forEach((p) => {
      deck.push({ uid: `${p.id}-t`, pairId: p.id, side: 'term', text: p.term });
      deck.push({ uid: `${p.id}-d`, pairId: p.id, side: 'definition', text: p.definition });
    });
    setMemoryCards(shuffleArray(deck));
    setFlippedUids([]);
    setMemoryMatchedPairIds([]);
    setMemoryMoves(0);
    setIsCheckingMemory(false);
  };

  useEffect(() => {
    initBoards();
  }, [kit.id]);

  const handleRightClick = (rightPair: MatchPair) => {
    if (!selectedLeftId || matchedIds.includes(rightPair.id)) return;
    setConnectAttempts((a) => a + 1);

    if (selectedLeftId === rightPair.id) {
      const next = [...matchedIds, rightPair.id];
      setMatchedIds(next);
      setSelectedLeftId(null);
      if (next.length === pairs.length) {
        onSolved();
      }
    } else {
      setWrongPairFlash({ left: selectedLeftId, right: rightPair.id });
      window.setTimeout(() => {
        setWrongPairFlash(null);
        setSelectedLeftId(null);
      }, 650);
    }
  };

  const handleMemoryCardClick = (card: MemoryCard) => {
    if (isCheckingMemory) return;
    if (memoryMatchedPairIds.includes(card.pairId)) return;
    if (flippedUids.includes(card.uid)) return;

    const nextFlipped = [...flippedUids, card.uid];
    setFlippedUids(nextFlipped);

    if (nextFlipped.length === 2) {
      setMemoryMoves((m) => m + 1);
      setIsCheckingMemory(true);
      const first = memoryCards.find((c) => c.uid === nextFlipped[0]);
      const second = memoryCards.find((c) => c.uid === nextFlipped[1]);

      if (first && second && first.pairId === second.pairId) {
        const nextMatched = [...memoryMatchedPairIds, first.pairId];
        setMemoryMatchedPairIds(nextMatched);
        setFlippedUids([]);
        setIsCheckingMemory(false);
        if (nextMatched.length === pairs.length) {
          onSolved();
        }
      } else {
        window.setTimeout(() => {
          setFlippedUids([]);
          setIsCheckingMemory(false);
        }, 850);
      }
    }
  };

  const pairOrderMap = useMemo(() => {
    const map: Record<string, number> = {};
    pairs.forEach((p, idx) => {
      map[p.id] = idx + 1;
    });
    return map;
  }, [pairs]);

  if (pairs.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-600">
        No hay pares disponibles para este material.
      </div>
    );
  }

  const isConnectDone = matchedIds.length === pairs.length;
  const isMemoryDone = memoryMatchedPairIds.length === pairs.length;

  return (
    <div className="space-y-5">
      {/* Top Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setMode('connect')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              mode === 'connect'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Conecta Conceptos
          </button>
          <button
            type="button"
            onClick={() => setMode('memory')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              mode === 'memory'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Juego de Memoria (Cartas)
          </button>
        </div>

        <div className="flex items-center gap-4 text-sm">
          {mode === 'connect' ? (
            <>
              <span className="text-slate-600 font-medium tabular-nums">
                Parejas: <strong className="text-slate-900">{matchedIds.length} / {pairs.length}</strong>
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-slate-600 font-medium tabular-nums">
                Intentos: <strong className="text-slate-900">{connectAttempts}</strong>
              </span>
            </>
          ) : (
            <>
              <span className="text-slate-600 font-medium tabular-nums">
                Encontradas: <strong className="text-slate-900">{memoryMatchedPairIds.length} / {pairs.length}</strong>
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-slate-600 font-medium tabular-nums">
                Movimientos: <strong className="text-slate-900">{memoryMoves}</strong>
              </span>
            </>
          )}

          <button
            type="button"
            onClick={initBoards}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Mezclar de nuevo</span>
          </button>
        </div>
      </div>

      {mode === 'connect' ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-sm text-slate-600">
              1. Haz clic en un <strong>concepto</strong> de la columna izquierda y luego en su{' '}
              <strong>definición o ejemplo</strong> en la derecha.
            </p>
            {isConnectDone && (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                <Trophy className="w-4 h-4" />
                ¡Tablero completado en {connectAttempts} intentos!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Terms */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500">Conceptos clave</p>
              {pairs.map((pair) => {
                const isMatched = matchedIds.includes(pair.id);
                const isSelected = selectedLeftId === pair.id;
                const isWrong = wrongPairFlash?.left === pair.id;

                return (
                  <button
                    key={pair.id}
                    type="button"
                    disabled={isMatched}
                    onClick={() => setSelectedLeftId(pair.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-colors flex items-center justify-between gap-3 ${
                      isMatched
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 cursor-default'
                        : isWrong
                        ? 'bg-red-50 border-red-400 text-red-900 cursor-pointer'
                        : isSelected
                        ? 'bg-sky-50 border-sky-600 text-sky-950 ring-2 ring-sky-500/20 cursor-pointer'
                        : 'bg-slate-50 border-slate-200 hover:border-sky-400 text-slate-900 cursor-pointer'
                    }`}
                  >
                    <div>
                      <span className="text-[11px] font-medium text-slate-500 block">
                        {pair.category}
                      </span>
                      <span className="font-display font-semibold text-base">{pair.term}</span>
                    </div>
                    {isMatched && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 tabular-nums shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                        #{pairOrderMap[pair.id]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Column: Shuffled Definitions */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500">Significados y ejemplos</p>
              {shuffledRight.map((pair) => {
                const isMatched = matchedIds.includes(pair.id);
                const isWrong = wrongPairFlash?.right === pair.id;

                return (
                  <button
                    key={pair.id}
                    type="button"
                    disabled={isMatched}
                    onClick={() => handleRightClick(pair)}
                    className={`w-full text-left p-4 rounded-xl border transition-colors flex items-center justify-between gap-3 ${
                      isMatched
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 cursor-default'
                        : isWrong
                        ? 'bg-red-50 border-red-400 text-red-900 cursor-pointer'
                        : selectedLeftId
                        ? 'bg-white border-sky-200 hover:border-sky-500 hover:bg-sky-50/40 text-slate-800 cursor-pointer'
                        : 'bg-slate-50 border-slate-200 text-slate-700 cursor-pointer'
                    }`}
                  >
                    <span className="text-sm font-medium leading-snug">{pair.definition}</span>
                    {isMatched && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 tabular-nums shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                        #{pairOrderMap[pair.id]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-sm text-slate-600">
              Voltea dos cartas por turno para emparejar cada concepto con su definición.
            </p>
            {isMemoryDone && (
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                  <Sparkles className="w-4 h-4" />
                  ¡Memoria completada en {memoryMoves} movimientos!
                </span>
                <button
                  type="button"
                  onClick={initBoards}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Otra partida</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {memoryCards.map((card) => {
              const isMatched = memoryMatchedPairIds.includes(card.pairId);
              const isFlipped = flippedUids.includes(card.uid) || isMatched;

              return (
                <button
                  key={card.uid}
                  type="button"
                  onClick={() => handleMemoryCardClick(card)}
                  disabled={isMatched}
                  className={`min-h-[120px] p-4 rounded-xl border text-left transition-colors flex flex-col justify-between cursor-pointer ${
                    isMatched
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                      : isFlipped
                      ? 'bg-sky-50 border-sky-500 text-slate-900'
                      : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {isFlipped ? (
                    <>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {card.side === 'term' ? 'Concepto' : 'Definición'}
                      </span>
                      <span
                        className={`${
                          card.side === 'term'
                            ? 'font-display text-base font-bold'
                            : 'text-xs sm:text-sm font-medium leading-snug'
                        }`}
                      >
                        {card.text}
                      </span>
                      <span className="text-[11px] font-medium text-emerald-700">
                        {isMatched ? '✓ Emparejada' : 'Buscando par...'}
                      </span>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center gap-1 py-4">
                      <span className="font-display text-lg font-bold text-sky-300">?</span>
                      <span className="text-xs text-slate-300">Tocar para voltear</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
