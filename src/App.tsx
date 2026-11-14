import React, { useEffect, useState } from 'react';
import {
  Network,
  Zap,
  Puzzle,
  ListOrdered,
  Layers,
  GraduationCap,
  ArrowLeft,
  CheckCircle2,
  Upload,
  Gamepad2,
  Scale,
  FolderKanban,
  KeyRound,
  Download,
} from 'lucide-react';
import {
  DidacticKit,
  LEVEL_LABELS,
  QuizQuestion,
  SavedLibraryItem,
  SessionProgress,
} from './types/didactic';
import { SAMPLE_KITS } from './data/sampleKits';
import { loadMergedLibrary, resolveSavedFileUrl } from './utils/libraryStorage';
import { UploadStudio } from './components/UploadStudio';
import { ConceptMapExplorer } from './components/ConceptMapExplorer';
import { TriviaGame } from './components/TriviaGame';
import { MatchMemoryGame } from './components/MatchMemoryGame';
import { SequenceClozeGame } from './components/SequenceClozeGame';
import { TrueFalseGame } from './components/TrueFalseGame';
import { CategorySorterGame } from './components/CategorySorterGame';
import { WordGuessGame } from './components/WordGuessGame';
import { FlashcardsDeck } from './components/FlashcardsDeck';
import { TeacherKitView } from './components/TeacherKitView';

type MainSection = 'mapa' | 'juegos' | 'tarjetas' | 'docente';
type GameId = 'trivia' | 'parejas' | 'verdadero' | 'clasificador' | 'secuencia' | 'descifra';

const EMPTY_PROGRESS = (kit: DidacticKit): SessionProgress => ({
  exploredConceptIds: kit.concepts[0] ? [kit.concepts[0].id] : [],
  quizBestScore: null,
  quizTotalQuestions: kit.quiz.length,
  pairsSolved: false,
  sequenceSolved: false,
  clozeSolvedCount: 0,
  trueFalseBest: null,
  categorySortSolved: false,
  wordGuessSolvedCount: 0,
  masteredFlashcardIds: [],
});

export default function App() {
  const [activeKit, setActiveKit] = useState<DidacticKit | null>(null);
  const [activeSection, setActiveSection] = useState<MainSection>('mapa');
  const [activeGame, setActiveGame] = useState<GameId>('trivia');
  const [progress, setProgress] = useState<SessionProgress | null>(null);
  const [savedItems, setSavedItems] = useState<SavedLibraryItem[]>([]);

  const refreshLibrary = async () => {
    const items = await loadMergedLibrary();
    setSavedItems(items);
  };

  useEffect(() => {
    void refreshLibrary();
  }, []);

  const openKit = (kit: DidacticKit) => {
    setActiveKit(kit);
    setActiveSection('mapa');
    setActiveGame('trivia');
    setProgress(EMPTY_PROGRESS(kit));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadActiveFile = async () => {
    if (!activeKit?.libraryId) return;
    const item = savedItems.find((s) => s.id === activeKit.libraryId);
    if (!item) return;
    const resolved = await resolveSavedFileUrl(item);
    if (!resolved) return;
    const anchor = document.createElement('a');
    anchor.href = resolved.isBlobUrl ? resolved.url : `${resolved.url}?download=1`;
    anchor.download = item.fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    if (resolved.isBlobUrl) {
      window.setTimeout(() => URL.revokeObjectURL(resolved.url), 1500);
    }
  };

  const handleBackToUpload = () => {
    setActiveKit(null);
    setProgress(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    if (activeKit) {
      setActiveKit(null);
      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuestionsExpanded = (newQuestions: QuizQuestion[]) => {
    setActiveKit((prev) => {
      if (!prev) return prev;
      const existingSet = new Set(prev.quiz.map((q) => q.question.trim().toLowerCase()));
      const uniqueNew = newQuestions.filter(
        (q) => !existingSet.has(q.question.trim().toLowerCase())
      );
      return {
        ...prev,
        quiz: [...prev.quiz, ...uniqueNew],
      };
    });
  };

  const mainTabs: Array<{ id: MainSection; label: string; icon: React.ReactNode }> = [
    { id: 'mapa', label: 'Mapa y Explicación', icon: <Network className="w-4 h-4" /> },
    { id: 'juegos', label: 'Centro de Juegos (6)', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'tarjetas', label: 'Tarjetas Activas', icon: <Layers className="w-4 h-4" /> },
    { id: 'docente', label: 'Kit del Docente', icon: <GraduationCap className="w-4 h-4" /> },
  ];

  const gameTabs: Array<{
    id: GameId;
    label: string;
    subtitle: string;
    icon: React.ReactNode;
    completed?: boolean;
  }> = [
    {
      id: 'trivia',
      label: '01. Trivia (10 / 20 / 30)',
      subtitle: 'Elige cuántas preguntas',
      icon: <Zap className="w-4 h-4" />,
      completed: progress?.quizBestScore !== null,
    },
    {
      id: 'parejas',
      label: '02. Parejas y Memoria',
      subtitle: 'Conecta o voltea cartas',
      icon: <Puzzle className="w-4 h-4" />,
      completed: progress?.pairsSolved,
    },
    {
      id: 'verdadero',
      label: '03. Verdadero o Falso',
      subtitle: 'Mito vs. realidad',
      icon: <Scale className="w-4 h-4" />,
      completed: progress?.trueFalseBest !== null,
    },
    {
      id: 'clasificador',
      label: '04. Clasificador',
      subtitle: 'Agrupa por categoría',
      icon: <FolderKanban className="w-4 h-4" />,
      completed: progress?.categorySortSolved,
    },
    {
      id: 'secuencia',
      label: '05. Ordena y Completa',
      subtitle: 'Pasos y palabras clave',
      icon: <ListOrdered className="w-4 h-4" />,
      completed: progress?.sequenceSolved,
    },
    {
      id: 'descifra',
      label: '06. Descifra el Término',
      subtitle: 'Adivina con pistas',
      icon: <KeyRound className="w-4 h-4" />,
      completed: (progress?.wordGuessSolvedCount || 0) > 0,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Strictly 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={handleBackToUpload}
            className="font-display text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
          >
            AulaViva
          </button>

          <nav
            aria-label="Navegación principal"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            {activeKit ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveSection('mapa')}
                  className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeSection === 'mapa' ? 'text-sky-700 font-semibold' : ''
                  }`}
                >
                  Mapa Visual
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('juegos')}
                  className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeSection === 'juegos' ? 'text-sky-700 font-semibold' : ''
                  }`}
                >
                  Juegos
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('tarjetas')}
                  className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeSection === 'tarjetas' ? 'text-sky-700 font-semibold' : ''
                  }`}
                >
                  Tarjetas
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('docente')}
                  className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeSection === 'docente' ? 'text-sky-700 font-semibold' : ''
                  }`}
                >
                  Guía Docente
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => scrollToSection('subir')}
                  className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Subir Archivo
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('guardados')}
                  className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Guardados ({savedItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('sistemas')}
                  className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Sistemas
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('ejemplos')}
                  className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Ejemplos
                </button>
              </>
            )}
          </nav>

          <div className="flex items-center shrink-0">
            {activeKit ? (
              <button
                type="button"
                onClick={handleBackToUpload}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Subir otro PDF / Word</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openKit(SAMPLE_KITS[0])}
                className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Explorar Ejemplo
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1320px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {!activeKit ? (
          <UploadStudio
            onKitGenerated={openKit}
            onSelectSample={openKit}
            savedItems={savedItems}
            onRefreshLibrary={refreshLibrary}
          />
        ) : (
          <div className="space-y-6">
            {/* Active Subject Header & Real Session Progress */}
            <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-4 mb-1 no-print">
                    <button
                      type="button"
                      onClick={handleBackToUpload}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Volver a subir / guardados</span>
                    </button>
                    {activeKit.libraryId && (
                      <button
                        type="button"
                        onClick={() => void handleDownloadActiveFile()}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar archivo guardado</span>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                    <span>{activeKit.discipline}</span>
                    <span aria-hidden="true">·</span>
                    <span>{LEVEL_LABELS[activeKit.level]}</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate max-w-[240px]">{activeKit.sourceFileName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{activeKit.estimatedStudyMinutes} min</span>
                  </div>

                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                    {activeKit.subjectTitle}
                  </h1>
                </div>

                {progress && (
                  <div className="flex flex-wrap items-center gap-3.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 shrink-0">
                    <div className="tabular-nums">
                      Mapa:{' '}
                      <strong className="text-slate-900">
                        {progress.exploredConceptIds.length}/{activeKit.concepts.length}
                      </strong>
                    </div>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <div className="tabular-nums">
                      Trivia:{' '}
                      <strong className="text-slate-900">
                        {progress.quizBestScore !== null
                          ? `${progress.quizBestScore}/${progress.quizTotalQuestions}`
                          : 'Pendiente'}
                      </strong>
                    </div>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <div className="inline-flex items-center gap-1 tabular-nums">
                      {progress.pairsSolved && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                      <span>
                        Juegos:{' '}
                        <strong className="text-slate-900">
                          {
                            [
                              progress.quizBestScore !== null,
                              progress.pairsSolved,
                              progress.trueFalseBest !== null,
                              progress.categorySortSolved,
                              progress.sequenceSolved,
                              progress.wordGuessSolvedCount > 0,
                            ].filter(Boolean).length
                          }
                          /6
                        </strong>
                      </span>
                    </div>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <div className="tabular-nums">
                      Tarjetas:{' '}
                      <strong className="text-slate-900">
                        {progress.masteredFlashcardIds.length}/{activeKit.flashcards.length}
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Primary 4-System Switcher */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-print">
                {mainTabs.map((tab) => {
                  const isActive = activeSection === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveSection(tab.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Active Workspace */}
            <section aria-live="polite" className="space-y-5">
              {activeSection === 'mapa' && progress && (
                <ConceptMapExplorer
                  kit={activeKit}
                  exploredIds={progress.exploredConceptIds}
                  onExploreConcept={(id) =>
                    setProgress((prev) =>
                      prev && !prev.exploredConceptIds.includes(id)
                        ? { ...prev, exploredConceptIds: [...prev.exploredConceptIds, id] }
                        : prev
                    )
                  }
                />
              )}

              {activeSection === 'juegos' && (
                <div className="space-y-6">
                  {/* 6-Game Selector Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 no-print">
                    {gameTabs.map((g) => {
                      const isCurrent = activeGame === g.id;
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setActiveGame(g.id)}
                          className={`text-left p-3.5 rounded-xl border transition-colors cursor-pointer flex flex-col justify-between gap-1.5 ${
                            isCurrent
                              ? 'bg-sky-50 border-sky-600 text-slate-900'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={isCurrent ? 'text-sky-700' : 'text-slate-500'}>
                              {g.icon}
                            </span>
                            {g.completed && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </div>
                          <div>
                            <p className="font-display text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                              {g.label}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                              {g.subtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Game Canvas */}
                  {activeGame === 'trivia' && (
                    <TriviaGame
                      kit={activeKit}
                      onQuestionsExpanded={handleQuestionsExpanded}
                      onFinishQuiz={(score, total) =>
                        setProgress((prev) =>
                          prev
                            ? {
                                ...prev,
                                quizBestScore: Math.max(prev.quizBestScore ?? 0, score),
                                quizTotalQuestions: total,
                              }
                            : prev
                        )
                      }
                    />
                  )}

                  {activeGame === 'parejas' && (
                    <MatchMemoryGame
                      kit={activeKit}
                      onSolved={() =>
                        setProgress((prev) => (prev ? { ...prev, pairsSolved: true } : prev))
                      }
                    />
                  )}

                  {activeGame === 'verdadero' && (
                    <TrueFalseGame
                      kit={activeKit}
                      onFinish={(score) =>
                        setProgress((prev) =>
                          prev
                            ? {
                                ...prev,
                                trueFalseBest: Math.max(prev.trueFalseBest ?? 0, score),
                              }
                            : prev
                        )
                      }
                    />
                  )}

                  {activeGame === 'clasificador' && (
                    <CategorySorterGame
                      kit={activeKit}
                      onSolved={() =>
                        setProgress((prev) =>
                          prev ? { ...prev, categorySortSolved: true } : prev
                        )
                      }
                    />
                  )}

                  {activeGame === 'secuencia' && (
                    <SequenceClozeGame
                      kit={activeKit}
                      onSequenceSolved={() =>
                        setProgress((prev) => (prev ? { ...prev, sequenceSolved: true } : prev))
                      }
                      onClozeSolvedCount={(count) =>
                        setProgress((prev) =>
                          prev
                            ? {
                                ...prev,
                                clozeSolvedCount: Math.max(prev.clozeSolvedCount, count),
                              }
                            : prev
                        )
                      }
                    />
                  )}

                  {activeGame === 'descifra' && (
                    <WordGuessGame
                      kit={activeKit}
                      onWordSolved={(count) =>
                        setProgress((prev) =>
                          prev
                            ? {
                                ...prev,
                                wordGuessSolvedCount: Math.max(
                                  prev.wordGuessSolvedCount,
                                  count
                                ),
                              }
                            : prev
                        )
                      }
                    />
                  )}
                </div>
              )}

              {activeSection === 'tarjetas' && progress && (
                <FlashcardsDeck
                  kit={activeKit}
                  masteredIds={progress.masteredFlashcardIds}
                  onMarkMastered={(id) =>
                    setProgress((prev) =>
                      prev && !prev.masteredFlashcardIds.includes(id)
                        ? {
                            ...prev,
                            masteredFlashcardIds: [...prev.masteredFlashcardIds, id],
                          }
                        : prev
                    )
                  }
                />
              )}

              {activeSection === 'docente' && <TeacherKitView kit={activeKit} />}
            </section>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white mt-auto no-print">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>AulaViva · Aprendizaje activo desde tus documentos PDF y Word</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleBackToUpload}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Subir material
            </button>
            <button
              type="button"
              onClick={() => openKit(SAMPLE_KITS[0])}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Ejemplo Biología
            </button>
            <button
              type="button"
              onClick={() => openKit(SAMPLE_KITS[1])}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Ejemplo Historia
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
