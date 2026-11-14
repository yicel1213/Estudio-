import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  RotateCcw,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { DidacticKit } from '../types/didactic';

interface WordGuessGameProps {
  kit: DidacticKit;
  onWordSolved: (count: number) => void;
}

interface WordChallenge {
  id: string;
  answer: string;
  clue: string;
  extraContext: string;
}

const SPANISH_ALPHABET = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
];

function normalizeChar(ch: string): string {
  return ch
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/N\u0303/g, 'Ñ');
}

function normalizeLetterKeepNtilde(ch: string): string {
  const upper = ch.toUpperCase();
  if (upper === 'Ñ') return 'Ñ';
  return upper.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const MAX_ERRORS = 6;

export const WordGuessGame: React.FC<WordGuessGameProps> = ({ kit, onWordSolved }) => {
  const challenges = useMemo<WordChallenge[]>(() => {
    const list: WordChallenge[] = [];
    const seen = new Set<string>();

    // Prefer single-word or concise two-word terms from clozeExercises and matchPairs
    kit.clozeExercises.forEach((c) => {
      const clean = c.blankAnswer.trim();
      const key = clean.toLowerCase();
      if (clean.length >= 3 && clean.length <= 20 && !seen.has(key)) {
        seen.add(key);
        list.push({
          id: `wg-${c.id}`,
          answer: clean,
          clue: `${c.beforeBlank} [ _____ ] ${c.afterBlank}`,
          extraContext: c.hint,
        });
      }
    });

    kit.matchPairs.forEach((m) => {
      const clean = m.term.trim();
      const key = clean.toLowerCase();
      if (clean.length >= 3 && clean.length <= 18 && !seen.has(key)) {
        seen.add(key);
        list.push({
          id: `wg-${m.id}`,
          answer: clean,
          clue: m.definition,
          extraContext: `Categoría: ${m.category}`,
        });
      }
    });

    return list.slice(0, 8);
  }, [kit]);

  const [wordIndex, setWordIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [solvedCount, setSolvedCount] = useState(0);

  useEffect(() => {
    setWordIndex(0);
    setGuessedLetters([]);
    setSolvedCount(0);
  }, [kit.id]);

  const current = challenges[wordIndex];

  const targetLetters = useMemo(() => {
    if (!current) return [];
    return Array.from(current.answer).map((raw) => ({
      raw,
      norm: normalizeLetterKeepNtilde(raw),
      isAlpha: /[A-ZÑ]/i.test(normalizeLetterKeepNtilde(raw)),
    }));
  }, [current]);

  const errorsCount = useMemo(() => {
    const validSet = new Set(targetLetters.filter((l) => l.isAlpha).map((l) => l.norm));
    return guessedLetters.filter((g) => !validSet.has(g)).length;
  }, [guessedLetters, targetLetters]);

  const isWon = useMemo(() => {
    if (targetLetters.length === 0) return false;
    return targetLetters.every((l) => !l.isAlpha || guessedLetters.includes(l.norm));
  }, [targetLetters, guessedLetters]);

  const isLost = errorsCount >= MAX_ERRORS && !isWon;
  const isRoundOver = isWon || isLost;

  const handleGuess = (letter: string) => {
    if (isRoundOver || guessedLetters.includes(letter)) return;
    const nextGuessed = [...guessedLetters, letter];
    setGuessedLetters(nextGuessed);

    const wonNow = targetLetters.every((l) => !l.isAlpha || nextGuessed.includes(l.norm));
    if (wonNow) {
      const nextSolved = solvedCount + 1;
      setSolvedCount(nextSolved);
      onWordSolved(nextSolved);
    }
  };

  const handleRevealOne = () => {
    if (isRoundOver) return;
    const unguessed = targetLetters.find(
      (l) => l.isAlpha && !guessedLetters.includes(l.norm)
    );
    if (unguessed) {
      handleGuess(unguessed.norm);
    }
  };

  const handleNextWord = () => {
    setWordIndex((i) => (i + 1) % challenges.length);
    setGuessedLetters([]);
  };

  if (challenges.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-600">
        No hay términos suficientes para este juego.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Top Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-sm">
          <span className="font-semibold text-slate-900 tabular-nums">
            Término {wordIndex + 1} de {challenges.length}
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="text-slate-600 font-medium tabular-nums">
            Descifrados: <strong className="text-emerald-700">{solvedCount}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* 6-segment remaining lives indicator */}
          <div className="flex items-center gap-1" aria-label={`Errores ${errorsCount} de ${MAX_ERRORS}`}>
            {Array.from({ length: MAX_ERRORS }).map((_, i) => (
              <span
                key={i}
                className={`w-4 h-2 rounded-xs ${
                  i < MAX_ERRORS - errorsCount ? 'bg-sky-600' : 'bg-red-200'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-600 font-medium tabular-nums ml-1">
            {MAX_ERRORS - errorsCount} vidas
          </span>
        </div>
      </div>

      {/* Main Board */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="space-y-2 text-center">
          <span className="text-xs font-semibold text-sky-700">Pista de la materia</span>
          <p className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed max-w-xl mx-auto">
            {current.clue}
          </p>
          <p className="text-xs text-slate-500">{current.extraContext}</p>
        </div>

        {/* Letter Slots */}
        <div className="flex flex-wrap items-center justify-center gap-2 py-2">
          {targetLetters.map((item, idx) => {
            if (!item.isAlpha) {
              return (
                <span key={idx} className="w-4 text-center font-bold text-slate-400">
                  {item.raw}
                </span>
              );
            }
            const revealed = guessedLetters.includes(item.norm) || isLost;
            return (
              <div
                key={idx}
                className={`w-9 h-11 sm:w-11 sm:h-12 rounded-lg border-2 flex items-center justify-center font-mono text-lg sm:text-xl font-bold ${
                  isLost && !guessedLetters.includes(item.norm)
                    ? 'bg-red-50 border-red-300 text-red-700'
                    : revealed
                    ? 'bg-sky-50 border-sky-500 text-slate-900'
                    : 'bg-slate-50 border-slate-300 text-transparent'
                }`}
              >
                {revealed ? item.raw.toUpperCase() : '_'}
              </div>
            );
          })}
        </div>

        {/* Keyboard */}
        {!isRoundOver && (
          <div className="space-y-4">
            <div className="flex flex-wrap justify-center gap-1.5">
              {SPANISH_ALPHABET.map((letter) => {
                const used = guessedLetters.includes(letter);
                const isHit =
                  used && targetLetters.some((l) => l.isAlpha && l.norm === letter);

                return (
                  <button
                    key={letter}
                    type="button"
                    disabled={used}
                    onClick={() => handleGuess(letter)}
                    className={`w-9 h-10 sm:w-10 sm:h-10 rounded-lg font-mono text-sm font-bold border transition-colors ${
                      isHit
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-900 cursor-default'
                        : used
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-default'
                        : 'bg-white border-slate-200 hover:border-sky-500 hover:bg-sky-50 text-slate-900 cursor-pointer'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleRevealOne}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-semibold text-amber-900 cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Revelar una letra de ayuda</span>
              </button>
            </div>
          </div>
        )}

        {/* Round Result */}
        {isRoundOver && (
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isWon
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-amber-50 border-amber-200 text-slate-900'
            }`}
          >
            <div className="flex items-start gap-3">
              {isWon ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-bold flex items-center gap-1.5">
                  {isWon ? (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-600" /> ¡Término descifrado!
                    </>
                  ) : (
                    <>El término era: {current.answer}</>
                  )}
                </p>
                <p className="text-xs text-slate-700 mt-0.5">{current.clue}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setGuessedLetters([])}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Repetir</span>
              </button>
              <button
                type="button"
                onClick={handleNextWord}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold cursor-pointer"
              >
                <span>Siguiente término</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
