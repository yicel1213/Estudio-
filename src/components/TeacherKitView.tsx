import React, { useState } from 'react';
import {
  Printer,
  Download,
  Clock,
  Users,
  MessageCircleQuestion,
  CheckSquare,
  Square,
  Lightbulb,
} from 'lucide-react';
import { DidacticKit, LEVEL_LABELS } from '../types/didactic';

interface TeacherKitViewProps {
  kit: DidacticKit;
}

export const TeacherKitView: React.FC<TeacherKitViewProps> = ({ kit }) => {
  const [checkedQuestions, setCheckedQuestions] = useState<number[]>([]);

  const toggleQuestion = (idx: number) => {
    setCheckedQuestions((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleDownloadMarkdown = () => {
    const lines: string[] = [
      `# ${kit.subjectTitle}`,
      `**Disciplina:** ${kit.discipline} | **Nivel:** ${LEVEL_LABELS[kit.level]} | **Fuente:** ${kit.sourceFileName}`,
      '',
      `## Gran Idea Central`,
      kit.bigIdea,
      '',
      `## Resumen Claro`,
      kit.executiveSummary,
      '',
      `## Método Feynman (Explicación Ultra Simple)`,
      kit.feynmanGuide.childLevelExplanation,
      '',
      `### Gancho de Inicio`,
      kit.feynmanGuide.realWorldHook,
      '',
      `### Preguntas Socráticas`,
      ...kit.feynmanGuide.socraticQuestions.map((q, i) => `${i + 1}. ${q}`),
      '',
      `## Guion de Clase en 3 Actos`,
      ...kit.lessonPlanActs.map(
        (act) =>
          `### Acto ${act.actNumber}: ${act.title} (${act.durationMinutes} min)\n- **Guía docente:** ${act.teacherAction}\n- **Actividad del estudiante:** ${act.studentActivity}`
      ),
      '',
      `## Dinámicas y Juegos de Aula`,
      ...kit.teachingMethods.map(
        (tm) =>
          `### ${tm.name} (${tm.durationMinutes} min · ${tm.bestFor})\n**Objetivo:** ${tm.objective}\n**Materiales:** ${tm.materialsNeeded.join(', ')}\n${tm.steps.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}`
      ),
      '',
      `## Ticket de Salida`,
      ...kit.exitTicketQuestions.map((q, i) => `${i + 1}. ${q}`),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${kit.subjectTitle.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ]+/g, '_')}_Guia.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Top Action Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-bold text-slate-900">
            Estrategias para Enseñar y Dinámicas de Aula
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Guion listo para explicar sin aburrir, preguntas detonantes y actividades participativas.
          </p>
        </div>

        <div className="flex items-center gap-2.5 no-print shrink-0">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir guía</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>Descargar (.md)</span>
          </button>
        </div>
      </div>

      {/* Feynman & Socratic Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-700">
            <Lightbulb className="w-4 h-4" />
            <span>Método Feynman · Explicación de 60 segundos</span>
          </div>
          <p className="text-base text-slate-900 leading-relaxed font-medium">
            {kit.feynmanGuide.childLevelExplanation}
          </p>
          <div className="p-4 rounded-lg bg-sky-50/70 border border-sky-200/80 space-y-1">
            <p className="text-xs font-semibold text-sky-800">Gancho de curiosidad inicial</p>
            <p className="text-sm text-slate-800 leading-relaxed">
              {kit.feynmanGuide.realWorldHook}
            </p>
          </div>
        </div>

        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <MessageCircleQuestion className="w-4 h-4" />
            <span>Preguntas Socráticas para activar el grupo</span>
          </div>
          <p className="text-xs text-slate-500">
            Haz estas preguntas antes de dar la definición formal para despertar hipótesis.
          </p>
          <div className="space-y-2.5">
            {kit.feynmanGuide.socraticQuestions.map((q, idx) => {
              const checked = checkedQuestions.includes(idx);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleQuestion(idx)}
                  className={`w-full text-left p-3.5 rounded-lg border transition-colors flex items-start gap-3 cursor-pointer ${
                    checked
                      ? 'bg-emerald-50/60 border-emerald-300 text-slate-600'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-900'
                  }`}
                >
                  {checked ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  )}
                  <span className={`text-sm leading-snug ${checked ? 'line-through' : ''}`}>
                    {q}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3-Act Lesson Plan */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div>
          <h4 className="font-display text-lg font-bold text-slate-900">
            Guion de Clase o Sesión en 3 Actos
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Estructura recomendada para alternar explicación breve y participación activa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {kit.lessonPlanActs.map((act) => (
            <div
              key={act.actNumber}
              className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-sky-700">Acto {act.actNumber}</span>
                <span className="inline-flex items-center gap-1 text-slate-500 tabular-nums">
                  <Clock className="w-3.5 h-3.5" />
                  {act.durationMinutes} min
                </span>
              </div>
              <h5 className="font-display font-bold text-base text-slate-900">{act.title}</h5>
              <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
                <p>
                  <strong className="text-slate-900">Qué hace quien enseña:</strong>{' '}
                  {act.teacherAction}
                </p>
                <p>
                  <strong className="text-slate-900">Qué hace el estudiante:</strong>{' '}
                  {act.studentActivity}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Classroom Games / Active Teaching Methods */}
      <div className="space-y-4">
        <h4 className="font-display text-lg font-bold text-slate-900">
          Dinámicas Prácticas y Juegos en Grupo
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {kit.teachingMethods.map((method) => (
            <div
              key={method.id}
              className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <Clock className="w-3.5 h-3.5" />
                    {method.durationMinutes} min
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {method.bestFor}
                  </span>
                </div>
                <h5 className="font-display text-lg font-bold text-slate-900">{method.name}</h5>
                <p className="text-sm text-slate-600">{method.objective}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-700">Paso a paso:</p>
                <ol className="space-y-2 text-sm text-slate-700">
                  {method.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-sky-50 text-sky-700 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {method.materialsNeeded.length > 0 && (
                <div className="pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <strong className="text-slate-800">Materiales:</strong>{' '}
                  {method.materialsNeeded.join(' · ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Exit Ticket */}
      {kit.exitTicketQuestions.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
          <h4 className="font-display text-base font-bold text-slate-900">
            Ticket de Salida (Verificación de cierre en 3 minutos)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kit.exitTicketQuestions.map((q, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-800"
              >
                <span className="font-mono text-xs text-slate-400 mr-2">0{idx + 1}.</span>
                {q}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
