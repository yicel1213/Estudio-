import React, { useMemo, useState } from 'react';
import {
  Lightbulb,
  AlertTriangle,
  BookOpen,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Compass,
  CheckCircle2,
  ListChecks,
} from 'lucide-react';
import { ConceptNode, DidacticKit } from '../types/didactic';

interface ConceptMapExplorerProps {
  kit: DidacticKit;
  exploredIds: string[];
  onExploreConcept: (id: string) => void;
}

export const ConceptMapExplorer: React.FC<ConceptMapExplorerProps> = ({
  kit,
  exploredIds,
  onExploreConcept,
}) => {
  const [selectedId, setSelectedId] = useState<string>(kit.concepts[0]?.id || '');
  const [viewMode, setViewMode] = useState<'estudiante' | 'docente'>('estudiante');
  const [activeStageFilter, setActiveStageFilter] = useState<number | 'all'>('all');

  const selectedConcept: ConceptNode | undefined = useMemo(
    () => kit.concepts.find((c) => c.id === selectedId) || kit.concepts[0],
    [kit.concepts, selectedId]
  );

  // Dynamic spacious SVG layout supporting 8-12+ concepts across 4-5 stages cleanly
  const layout = useMemo(() => {
    const stageNums = Array.from(new Set(kit.concepts.map((c) => c.stage))).sort((a, b) => a - b);
    const colCount = Math.max(1, stageNums.length);
    const maxNodesInCol = Math.max(
      1,
      ...stageNums.map((st) => kit.concepts.filter((c) => c.stage === st).length)
    );

    const svgW = Math.max(820, colCount * 195);
    const svgH = Math.max(430, maxNodesInCol * 116 + 90);
    const padX = 115;

    const positions: Record<string, { x: number; y: number }> = {};
    stageNums.forEach((st, colIdx) => {
      const nodesInStage = kit.concepts.filter((c) => c.stage === st);
      const x =
        colCount === 1
          ? svgW / 2
          : padX + (colIdx * (svgW - padX * 2)) / Math.max(1, colCount - 1);

      nodesInStage.forEach((node, rowIdx) => {
        const count = nodesInStage.length;
        // Slight alternating horizontal stagger when a column has 3+ nodes for visual clarity
        const stagger = count >= 3 ? (rowIdx % 2 === 0 ? -12 : 12) : 0;
        const y =
          count === 1
            ? svgH / 2 + 12
            : 95 + (rowIdx * (svgH - 160)) / Math.max(1, count - 1);
        positions[node.id] = { x: x + stagger, y };
      });
    });

    return { svgW, svgH, positions, stageNums, padX };
  }, [kit.concepts]);

  const handleSelectNode = (id: string) => {
    setSelectedId(id);
    onExploreConcept(id);
  };

  const currentConceptIndex = kit.concepts.findIndex((c) => c.id === selectedConcept?.id);

  const handleStep = (delta: number) => {
    if (kit.concepts.length === 0) return;
    const nextIdx = (currentConceptIndex + delta + kit.concepts.length) % kit.concepts.length;
    handleSelectNode(kit.concepts[nextIdx].id);
  };

  const currentStageInfo = kit.stages.find((s) => s.stageNumber === selectedConcept?.stage);

  return (
    <div className="space-y-6">
      {/* Executive Summary + Big Idea Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-sky-700">La Gran Idea Central</span>
            <p className="font-display text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {kit.bigIdea}
            </p>
          </div>
          <div className="text-xs text-slate-500 font-medium tabular-nums whitespace-nowrap shrink-0">
            {exploredIds.length} de {kit.concepts.length} puntos explorados
          </div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
          {kit.executiveSummary}
        </p>
      </div>

      {/* Learning Stages Ribbon */}
      {kit.stages.length > 0 && (
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 ${
            kit.stages.length >= 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'
          } gap-3`}
        >
          {kit.stages.map((st) => {
            const isSelectedStage = selectedConcept?.stage === st.stageNumber;
            const isFiltered = activeStageFilter === st.stageNumber;
            return (
              <button
                key={st.stageNumber}
                type="button"
                onClick={() => {
                  setActiveStageFilter(isFiltered ? 'all' : st.stageNumber);
                  const firstInStage = kit.concepts.find((c) => c.stage === st.stageNumber);
                  if (firstInStage) handleSelectNode(firstInStage.id);
                }}
                className={`text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                  isSelectedStage || isFiltered
                    ? 'bg-sky-50/70 border-sky-500 text-slate-900'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs font-semibold mb-1">
                  <span className={isSelectedStage ? 'text-sky-700' : 'text-slate-500'}>
                    Etapa {st.stageNumber}
                  </span>
                  {isFiltered && <span className="text-sky-700">Filtrando</span>}
                </div>
                <p className="font-display font-semibold text-sm text-slate-900 line-clamp-1">
                  {st.title}
                </p>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{st.keyTakeaway}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Two-Zone Sandbox Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Zone: Interactive SVG Concept Network */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">
                Mapa Interactivo de Conceptos ({kit.concepts.length} puntos clave)
              </h3>
              <p className="text-xs text-slate-500">
                Toca cualquier nodo del mapa para ver sus puntos clave, analogía y consejos.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {activeStageFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => setActiveStageFilter('all')}
                  className="px-2.5 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 rounded-lg cursor-pointer"
                >
                  Ver todas
                </button>
              )}
              <button
                type="button"
                onClick={() => handleStep(-1)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
              <button
                type="button"
                onClick={() => handleStep(1)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="relative w-full bg-slate-50 border border-slate-200 rounded-lg overflow-x-auto">
            <svg
              viewBox={`0 0 ${layout.svgW} ${layout.svgH}`}
              className="w-full h-auto min-h-[340px]"
              role="img"
              aria-label="Diagrama de conceptos conectados de la materia"
            >
              <defs>
                <marker
                  id="arrow-muted"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#94a3b8" />
                </marker>
                <marker
                  id="arrow-active"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0284c7" />
                </marker>
              </defs>

              <pattern id="dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#e2e8f0" />
              </pattern>
              <rect width={layout.svgW} height={layout.svgH} fill="url(#dot-grid)" />

              {/* Stage column headers */}
              {layout.stageNums.map((st, idx) => {
                const x =
                  layout.stageNums.length === 1
                    ? layout.svgW / 2
                    : layout.padX +
                      (idx * (layout.svgW - layout.padX * 2)) /
                        Math.max(1, layout.stageNums.length - 1);
                return (
                  <text
                    key={st}
                    x={x}
                    y={28}
                    textAnchor="middle"
                    className="fill-slate-400 text-[11px] font-semibold"
                  >
                    ETAPA {st}
                  </text>
                );
              })}

              {/* Directional edges */}
              {kit.concepts.map((node) =>
                node.connectsTo.map((targetId) => {
                  const from = layout.positions[node.id];
                  const to = layout.positions[targetId];
                  if (!from || !to) return null;
                  const isHighlighted =
                    selectedConcept?.id === node.id || selectedConcept?.id === targetId;

                  const dx = to.x - from.x;
                  const dy = to.y - from.y;
                  const dist = Math.hypot(dx, dy) || 1;
                  const pad = 62;
                  const x1 = from.x + (dx / dist) * pad;
                  const y1 = from.y + (dy / dist) * (pad * 0.42);
                  const x2 = to.x - (dx / dist) * pad;
                  const y2 = to.y - (dy / dist) * (pad * 0.42);
                  const mx = (x1 + x2) / 2;
                  const my = (y1 + y2) / 2 - 16;

                  return (
                    <path
                      key={`${node.id}-${targetId}`}
                      d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                      fill="none"
                      stroke={isHighlighted ? '#0284c7' : '#cbd5e1'}
                      strokeWidth={isHighlighted ? 2.5 : 1.5}
                      strokeDasharray={isHighlighted ? undefined : '4 3'}
                      markerEnd={isHighlighted ? 'url(#arrow-active)' : 'url(#arrow-muted)'}
                    />
                  );
                })
              )}

              {/* Concept Nodes */}
              {kit.concepts.map((node, index) => {
                const pos = layout.positions[node.id];
                if (!pos) return null;
                const isSelected = selectedConcept?.id === node.id;
                const isConnected =
                  selectedConcept?.connectsTo.includes(node.id) ||
                  node.connectsTo.includes(selectedConcept?.id || '');
                const isDimmed =
                  activeStageFilter !== 'all' && node.stage !== activeStageFilter && !isSelected;
                const isExplored = exploredIds.includes(node.id);

                const boxW = 148;
                const boxH = 56;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${pos.x - boxW / 2}, ${pos.y - boxH / 2})`}
                    onClick={() => handleSelectNode(node.id)}
                    className="cursor-pointer"
                    style={{ opacity: isDimmed ? 0.35 : 1 }}
                  >
                    <rect
                      width={boxW}
                      height={boxH}
                      rx={10}
                      fill={isSelected ? '#0284c7' : isConnected ? '#e0f2fe' : '#ffffff'}
                      stroke={isSelected ? '#0369a1' : isConnected ? '#38bdf8' : '#cbd5e1'}
                      strokeWidth={isSelected ? 2 : 1.5}
                    />
                    <text
                      x={boxW / 2}
                      y={24}
                      textAnchor="middle"
                      className={`text-[12px] font-semibold ${
                        isSelected ? 'fill-white' : 'fill-slate-900'
                      }`}
                    >
                      {node.shortLabel.length > 19
                        ? `${node.shortLabel.slice(0, 17)}…`
                        : node.shortLabel}
                    </text>
                    <text
                      x={boxW / 2}
                      y={42}
                      textAnchor="middle"
                      className={`text-[10px] ${
                        isSelected
                          ? 'fill-sky-100'
                          : isExplored
                          ? 'fill-emerald-700'
                          : 'fill-slate-500'
                      }`}
                    >
                      {isExplored ? `✓ Punto ${index + 1}` : `Punto ${index + 1} · Etapa ${node.stage}`}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Quick Node Index */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {kit.concepts.map((c, idx) => {
              const active = selectedConcept?.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectNode(c.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums ${
                    active
                      ? 'bg-sky-600 border-sky-600 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {idx + 1}. {c.shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Zone: Concept Inspector & Dual Pedagogical Mode */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5">
          {selectedConcept ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setViewMode('estudiante')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      viewMode === 'estudiante'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Entender fácil</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('docente')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      viewMode === 'docente'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Cómo enseñarlo</span>
                  </button>
                </div>

                <span className="text-xs text-slate-500 font-medium tabular-nums">
                  {currentConceptIndex + 1} / {kit.concepts.length}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
                  <span>Etapa {selectedConcept.stage}</span>
                  {currentStageInfo && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{currentStageInfo.title}</span>
                    </>
                  )}
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900">
                  {selectedConcept.title}
                </h3>
              </div>

              {viewMode === 'estudiante' ? (
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500">Explicación clara</p>
                    <p className="text-sm text-slate-800 leading-relaxed">
                      {selectedConcept.simpleExplanation}
                    </p>
                  </div>

                  {selectedConcept.keyPoints && selectedConcept.keyPoints.length > 0 && (
                    <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <ListChecks className="w-4 h-4 text-sky-600 shrink-0" />
                        <span>Puntos clave para recordar</span>
                      </div>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                        {selectedConcept.keyPoints.map((kp, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="font-mono text-xs text-sky-700 font-bold mt-0.5">
                              •
                            </span>
                            <span>{kp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="p-3.5 rounded-lg bg-sky-50/70 border border-sky-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-800">
                      <Lightbulb className="w-4 h-4 shrink-0" />
                      <span>Analogía cotidiana</span>
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed">
                      {selectedConcept.everydayAnalogy}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      <Compass className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>Ejemplo del documento</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {selectedConcept.documentExample}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Consejo práctico para clase</span>
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed">
                      {selectedConcept.teachingTip}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Error común a prevenir</span>
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed">
                      {selectedConcept.commonMisconception}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <p className="text-xs font-semibold text-slate-500">Analogía recomendada</p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {selectedConcept.everydayAnalogy}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {selectedConcept && selectedConcept.connectsTo.length > 0 && (
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <p className="text-xs font-semibold text-slate-500">Conecta directamente con:</p>
              <div className="flex flex-wrap gap-2">
                {selectedConcept.connectsTo.map((targetId) => {
                  const target = kit.concepts.find((c) => c.id === targetId);
                  if (!target) return null;
                  return (
                    <button
                      key={targetId}
                      type="button"
                      onClick={() => handleSelectNode(targetId)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-sky-100 text-xs font-semibold text-slate-800 hover:text-sky-800 transition-colors cursor-pointer"
                    >
                      <span>{target.shortLabel}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
