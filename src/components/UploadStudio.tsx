import React, { useRef, useState } from 'react';
import {
  Upload,
  FileText,
  BookOpen,
  Gamepad2,
  Layers,
  GraduationCap,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Download,
  Eye,
  Trash2,
  FolderOpen,
  X,
} from 'lucide-react';
import {
  DidacticKit,
  EducationLevel,
  LearningFocus,
  LEVEL_LABELS,
  FOCUS_LABELS,
  SavedLibraryItem,
} from '../types/didactic';
import { SAMPLE_KITS } from '../data/sampleKits';
import heroDidacticStudioImg from '../assets/images/hero_didactic_studio_1794591844301.jpg';
import {
  saveKitAndFileLocally,
  resolveSavedFileUrl,
  removeSavedLibraryItem,
} from '../utils/libraryStorage';

interface UploadStudioProps {
  onKitGenerated: (kit: DidacticKit) => void;
  onSelectSample: (kit: DidacticKit) => void;
  savedItems: SavedLibraryItem[];
  onRefreshLibrary: () => Promise<void>;
}

const HERO_IMAGE_PATH = heroDidacticStudioImg;
const CHUNK_THRESHOLD_BYTES = 6 * 1024 * 1024;
const CHUNK_SIZE_BYTES = 4 * 1024 * 1024;

export const UploadStudio: React.FC<UploadStudioProps> = ({
  onKitGenerated,
  onSelectSample,
  savedItems,
  onRefreshLibrary,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [pastedTitle, setPastedTitle] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [level, setLevel] = useState<EducationLevel>('secundaria');
  const [focus, setFocus] = useState<LearningFocus>('ambos');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{
    title: string;
    url: string;
    isBlobUrl: boolean;
  } | null>(null);

  const handleFilesPick = async (fileList: FileList | null | undefined) => {
    setErrorMsg(null);
    if (!fileList || fileList.length === 0) return;

    const validFiles: File[] = [];
    let skippedEmpty = 0;
    let failedCloudRead = 0;

    for (const file of Array.from(fileList)) {
      if (file.size === 0) {
        skippedEmpty += 1;
        continue;
      }
      try {
        await file.slice(0, 64).arrayBuffer();
        validFiles.push(file);
      } catch {
        failedCloudRead += 1;
      }
    }

    if (failedCloudRead > 0) {
      setErrorMsg(
        'No se pudo leer uno de los archivos desde tu equipo (puede estar pendiente de descarga desde la nube). Descárgalo localmente e intenta de nuevo.'
      );
    } else if (skippedEmpty > 0 && validFiles.length === 0) {
      setErrorMsg('El archivo seleccionado está vacío (0 bytes).');
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => {
        const seen = new Set(prev.map((f) => `${f.name}:${f.size}:${f.lastModified}`));
        const next = [...prev];
        for (const f of validFiles) {
          const key = `${f.name}:${f.size}:${f.lastModified}`;
          if (!seen.has(key)) {
            seen.add(key);
            next.push(f);
          }
        }
        return next;
      });
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setErrorMsg(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    void handleFilesPick(e.dataTransfer.files);
  };

  const readKitResponse = async (
    response: Response,
    onProgress: (message: string, percent?: number) => void
  ): Promise<DidacticKit> => {
    const contentType = (response.headers.get('content-type') || '').toLowerCase();

    if (contentType.includes('text/event-stream') && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let completedKit: DidacticKit | null = null;
      let streamError: string | null = null;

      const processBlock = (rawBlock: string) => {
        const lines = rawBlock.split(/\r?\n/);
        let eventType = 'message';
        const dataLines: string[] = [];

        for (const line of lines) {
          if (!line || line.startsWith(':')) continue;
          if (line.startsWith('event:')) {
            eventType = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            dataLines.push(line.slice(5).trimStart());
          }
        }

        if (dataLines.length === 0) return;
        const payloadText = dataLines.join('\n');
        let parsed: Record<string, unknown> = {};
        try {
          parsed = JSON.parse(payloadText) as Record<string, unknown>;
        } catch {
          return;
        }

        if (eventType === 'progress') {
          if (typeof parsed.message === 'string') {
            onProgress(
              parsed.message,
              typeof parsed.percent === 'number' ? parsed.percent : undefined
            );
          }
        } else if (eventType === 'complete' && parsed.kit) {
          onProgress('¡Listo!', 100);
          completedKit = parsed.kit as DidacticKit;
        } else if (eventType === 'error') {
          streamError =
            typeof parsed.error === 'string'
              ? parsed.error
              : 'Ocurrió un problema al procesar el documento.';
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (value) {
          buffer += decoder.decode(value, { stream: !done });
          const blocks = buffer.split(/\r?\n\r?\n/);
          buffer = blocks.pop() ?? '';
          for (const block of blocks) {
            processBlock(block);
          }
        }
        if (done) break;
      }

      if (buffer.trim()) {
        processBlock(buffer);
      }

      if (streamError) {
        throw new Error(streamError);
      }
      if (!completedKit) {
        throw new Error(
          'La conexión se interrumpió antes de completar el kit. Intenta subir el documento nuevamente.'
        );
      }
      return completedKit;
    }

    const rawBody = await response.text();
    let data: { error?: string; kit?: DidacticKit } = {};
    try {
      data = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      throw new Error(
        response.status === 413
          ? 'El fragmento superó el límite de red; intenta de nuevo.'
          : 'El servidor tardó demasiado o devolvió una respuesta inesperada. Intenta nuevamente.'
      );
    }

    if (!response.ok) {
      throw new Error(data?.error || 'Ocurrió un problema al generar el material didáctico.');
    }
    if (!data?.kit) {
      throw new Error('La respuesta no incluyó el kit didáctico esperado.');
    }
    return data.kit;
  };

  const uploadAndAnalyzeSingleFile = async (
    file: File,
    fileIndex: number,
    totalFiles: number
  ): Promise<DidacticKit> => {
    const prefix = totalFiles > 1 ? `[${fileIndex + 1}/${totalFiles}] ` : '';
    const updateProgress = (message: string, percent?: number) => {
      setLoadingStage(`${prefix}${message}`);
      if (typeof percent === 'number') {
        const scaled =
          totalFiles > 1
            ? Math.round(((fileIndex + percent / 100) / totalFiles) * 100)
            : percent;
        setLoadingPercent(Math.max(5, Math.min(100, scaled)));
      }
    };

    let response: Response;

    if (file.size > CHUNK_THRESHOLD_BYTES) {
      const uploadId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE_BYTES);

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex += 1) {
        const start = chunkIndex * CHUNK_SIZE_BYTES;
        const end = Math.min(file.size, start + CHUNK_SIZE_BYTES);
        const chunkBlob = file.slice(start, end);
        const uploadPercent = Math.round(4 + ((chunkIndex + 1) / totalChunks) * 18);
        updateProgress(
          `Subiendo "${file.name}" (parte ${chunkIndex + 1}/${totalChunks})...`,
          uploadPercent
        );

        const chunkRes = await fetch('/api/upload-chunk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'x-upload-id': uploadId,
            'x-chunk-index': String(chunkIndex),
          },
          body: chunkBlob,
        });

        if (!chunkRes.ok) {
          let errMsg = 'No se pudo subir una parte del archivo.';
          try {
            const errJson = (await chunkRes.json()) as { error?: string };
            if (errJson?.error) errMsg = errJson.error;
          } catch {
            // keep default error
          }
          throw new Error(errMsg);
        }
      }

      updateProgress(`Procesando "${file.name}"...`, 24);
      response = await fetch('/api/analyze-uploaded?stream=1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream, application/json',
        },
        body: JSON.stringify({
          uploadId,
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          level,
          focus,
        }),
      });
    } else {
      updateProgress(`Subiendo "${file.name}" y leyendo su contenido...`, 12);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('level', level);
      formData.append('focus', focus);
      response = await fetch('/api/analyze-document?stream=1', {
        method: 'POST',
        headers: { Accept: 'text/event-stream, application/json' },
        body: formData,
      });
    }

    const kit = await readKitResponse(response, updateProgress);
    await saveKitAndFileLocally(kit, file);
    return kit;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (inputMode === 'file' && selectedFiles.length === 0) {
      setErrorMsg('Selecciona o arrastra uno o más archivos PDF o Word para empezar.');
      return;
    }
    if (inputMode === 'text' && pastedText.trim().length < 5) {
      setErrorMsg('Escribe o pega al menos unas palabras de la materia.');
      return;
    }

    setIsLoading(true);
    setLoadingPercent(8);
    setLoadingStage(
      inputMode === 'file'
        ? 'Subiendo documento y leyendo su contenido...'
        : 'Analizando tus apuntes y estructurando los juegos...'
    );

    try {
      if (inputMode === 'file') {
        let firstKit: DidacticKit | null = null;
        for (let i = 0; i < selectedFiles.length; i += 1) {
          const kit = await uploadAndAnalyzeSingleFile(
            selectedFiles[i],
            i,
            selectedFiles.length
          );
          if (!firstKit) firstKit = kit;
        }
        await onRefreshLibrary();
        setSelectedFiles([]);
        if (firstKit) {
          onKitGenerated(firstKit);
        }
        return;
      }

      const response = await fetch('/api/analyze-text?stream=1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream, application/json',
        },
        body: JSON.stringify({
          title: pastedTitle.trim() || 'Apuntes_de_Materia.txt',
          text: pastedText,
          level,
          focus,
        }),
      });

      const kit = await readKitResponse(response, (message, percent) => {
        setLoadingStage(message);
        if (typeof percent === 'number') setLoadingPercent(percent);
      });

      await saveKitAndFileLocally(kit, null);
      await onRefreshLibrary();
      onKitGenerated(kit);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error de conexión con el servidor.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
      setLoadingStage('');
      setLoadingPercent(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(iso));
    } catch {
      return '';
    }
  };

  const handleOpenPreview = async (item: SavedLibraryItem) => {
    const resolved = await resolveSavedFileUrl(item);
    if (!resolved) {
      setErrorMsg('El archivo original ya no está disponible para vista previa.');
      return;
    }
    setPreviewDoc({
      title: item.fileName,
      url: resolved.url,
      isBlobUrl: resolved.isBlobUrl,
    });
  };

  const handleClosePreview = () => {
    if (previewDoc?.isBlobUrl) {
      URL.revokeObjectURL(previewDoc.url);
    }
    setPreviewDoc(null);
  };

  const handleDownloadSaved = async (item: SavedLibraryItem) => {
    const resolved = await resolveSavedFileUrl(item);
    if (!resolved) {
      setErrorMsg('No se encontró el archivo guardado para descargar.');
      return;
    }
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

  const handleDeleteSaved = async (id: string) => {
    await removeSavedLibraryItem(id);
    await onRefreshLibrary();
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Split */}
      <section
        id="subir"
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch pt-4"
      >
        {/* Left: Title + Upload Form */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
              <span>PDF y Word (.docx)</span>
              <span aria-hidden="true">·</span>
              <span>6 sistemas didácticos</span>
              <span aria-hidden="true">·</span>
              <span>Para aprender o enseñar</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.6rem] font-bold tracking-tight text-slate-900 leading-[1.12] text-balance">
              Convierte cualquier PDF o Word en juegos y formas fáciles de enseñar
            </h1>

            <p className="text-slate-600 text-base leading-relaxed max-w-2xl">
              Sube tus apuntes, guías o lecturas. AulaViva transforma la materia en un mapa
              conceptual interactivo, trivia, memoria, secuencias lógicas, tarjetas activas y un
              guion paso a paso para clase.
            </p>

            {/* Input Mode Tabs */}
            <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setInputMode('file');
                  setErrorMsg(null);
                }}
                className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  inputMode === 'file'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Subir archivo PDF o Word
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputMode('text');
                  setErrorMsg(null);
                }}
                className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  inputMode === 'text'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pegar texto o apuntes
              </button>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="mt-6 space-y-5">
            {inputMode === 'file' ? (
              <label
                htmlFor="aulaviva-file-input"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={handleDrop}
                className={`block border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                  isDragging
                    ? 'border-sky-600 bg-sky-50/70'
                    : selectedFiles.length > 0
                    ? 'border-emerald-500/60 bg-emerald-50/40'
                    : 'border-slate-300 bg-slate-50/60 hover:border-sky-500 hover:bg-sky-50/30'
                }`}
              >
                <input
                  id="aulaviva-file-input"
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="sr-only"
                  onClick={(e) => {
                    e.currentTarget.value = '';
                  }}
                  onChange={(e) => {
                    void handleFilesPick(e.target.files);
                  }}
                />

                {selectedFiles.length > 0 ? (
                  <div className="space-y-3 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          {selectedFiles.length === 1
                            ? '1 archivo listo para procesar'
                            : `${selectedFiles.length} archivos listos para procesar`}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-sky-700 hover:underline">
                        + Agregar más archivos
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {selectedFiles.map((file, idx) => (
                        <div
                          key={`${file.name}-${file.size}-${file.lastModified}`}
                          className="flex items-center justify-between gap-2 bg-white border border-emerald-200 rounded-lg px-3 py-2"
                        >
                          <div className="min-w-0 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-900 truncate">
                                {file.name}
                              </p>
                              <p className="text-[11px] text-slate-500 tabular-nums">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeSelectedFile(idx);
                            }}
                            title="Quitar archivo"
                            className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="w-11 h-11 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center mx-auto">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      Arrastra tus PDF o Word aquí, o haz clic para elegir
                    </p>
                    <p className="text-xs text-slate-500">
                      Sin límite de tamaño ni cantidad · Compatible con .pdf, .docx, .doc, .rtf,
                      .odt y texto
                    </p>
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:border-sky-500 hover:text-sky-700 transition-colors">
                      Seleccionar archivos
                    </span>
                  </div>
                )}
              </label>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={pastedTitle}
                  onChange={(e) => setPastedTitle(e.target.value)}
                  placeholder="Título opcional del tema (ej. Ciclo del Agua)"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600"
                />
                <textarea
                  rows={5}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Pega aquí el contenido, resumen o tema de tu clase para convertirlo en juegos y sistemas de enseñanza..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 resize-y"
                />
              </div>
            )}

            {/* Configuration Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nivel educativo
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as EducationLevel)}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600"
                >
                  {(Object.keys(LEVEL_LABELS) as EducationLevel[]).map((key) => (
                    <option key={key} value={key}>
                      {LEVEL_LABELS[key]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Enfoque principal
                </label>
                <select
                  value={focus}
                  onChange={(e) => setFocus(e.target.value as LearningFocus)}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600"
                >
                  {(Object.keys(FOCUS_LABELS) as LearningFocus[]).map((key) => (
                    <option key={key} value={key}>
                      {FOCUS_LABELS[key]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-3 pt-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creando sistemas didácticos...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Crear Sistemas Didácticos</span>
                    </>
                  )}
                </button>

                {isLoading && loadingStage && (
                  <p className="text-xs text-slate-600 font-medium">{loadingStage}</p>
                )}
              </div>

              {isLoading && (
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-sky-600 h-full transition-all duration-500"
                    style={{ width: `${Math.max(8, loadingPercent)}%` }}
                  />
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Right: Editorial Image Anchor */}
        <div className="lg:col-span-5 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 min-h-[320px]">
          {!heroImgFailed ? (
            <img
              src={HERO_IMAGE_PATH}
              alt="Mesa de estudio ordenada con libro abierto, bloques didácticos y tarjetas de repaso"
              referrerPolicy="no-referrer"
              onError={() => setHeroImgFailed(true)}
              className="w-full h-full object-cover lg:h-full"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-100 text-slate-600 text-center">
              <BookOpen className="w-12 h-12 text-sky-600 mb-3" />
              <p className="font-display font-semibold text-lg text-slate-900">
                De documento denso a experiencia interactiva
              </p>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-slate-950/85 via-slate-950/45 to-transparent text-white">
            <p className="text-xs font-medium text-sky-200 mb-1">
              Un archivo · Seis formas de dominar la materia
            </p>
            <p className="font-display text-lg font-semibold leading-snug">
              Mapa visual, 6 juegos interactivos, tarjetas activas y dinámicas listas para el aula.
            </p>
          </div>
        </div>
      </section>

      {/* Saved PDFs & Documents Library */}
      <section id="guardados" className="border-t border-slate-200 pt-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Tus PDFs y documentos guardados
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Cada PDF o Word que subes se guarda automáticamente para abrir sus juegos, leerlo o
              descargarlo cuando quieras.
            </p>
          </div>
          {savedItems.length > 0 && (
            <span className="text-xs font-semibold text-slate-500 tabular-nums">
              {savedItems.length} {savedItems.length === 1 ? 'archivo guardado' : 'archivos guardados'}
            </span>
          )}
        </div>

        {savedItems.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-slate-600">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Aún no tienes archivos guardados en esta biblioteca
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Cuando subas tu primer PDF o Word arriba, quedará guardado aquí de forma automática
                para volver a jugarlo o descargarlo sin subirlo de nuevo.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedItems.map((item) => {
              const isPdfItem =
                item.sourceType === 'pdf' || item.fileName.toLowerCase().endsWith('.pdf');
              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                      <span className="uppercase">{item.sourceType}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{formatFileSize(item.fileSize)}</span>
                      {item.savedAt && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{formatDate(item.savedAt)}</span>
                        </>
                      )}
                    </div>
                    <h3 className="font-display text-base font-bold text-slate-900 leading-snug line-clamp-2">
                      {item.kit.subjectTitle}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">{item.fileName}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onKitGenerated(item.kit)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <span>Abrir sistemas</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {item.hasOriginalFile && isPdfItem && (
                      <button
                        type="button"
                        onClick={() => void handleOpenPreview(item)}
                        title="Ver PDF guardado"
                        className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver</span>
                      </button>
                    )}

                    {item.hasOriginalFile && (
                      <button
                        type="button"
                        onClick={() => void handleDownloadSaved(item)}
                        title="Descargar archivo guardado"
                        className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => void handleDeleteSaved(item.id)}
                      title="Eliminar de guardados"
                      className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4-Column Capability Strip */}
      <section id="sistemas" className="border-t border-slate-200 pt-10">
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Qué crea cada documento que subes
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Todos los módulos se generan a partir del contenido real de tu PDF o Word.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-display font-semibold text-base text-slate-900">
              01. Mapa de Puntos Clave
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Divide la materia en 4 o 5 etapas con de 8 a 10 nodos conectados, puntos clave,
              analogías cotidianas y guía docente.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <h3 className="font-display font-semibold text-base text-slate-900">
              02. Trivia 10 / 20 / 30 y Memoria
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Trivia configurable de 10, 20 o 30 preguntas con explicación inmediata, más Conecta
              Conceptos y Memoria de cartas.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-display font-semibold text-base text-slate-900">
              03. 4 Juegos Extra + Tarjetas
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Verdadero o Falso, Clasificador por Categorías, Ordena y Completa, Descifra el
              Término y Flashcards 3D.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h3 className="font-display font-semibold text-base text-slate-900">
              04. Kit y Dinámicas de Aula
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Método Feynman, preguntas socráticas, juegos grupales sin costo, guion en 3 actos y
              guía imprimible.
            </p>
          </div>
        </div>
      </section>

      {/* Instant Sample Topics */}
      <section id="ejemplos" className="border-t border-slate-200 pt-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Prueba ahora con una materia de ejemplo
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Explora los 6 sistemas interactivos al instante antes de subir tu propio archivo.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SAMPLE_KITS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSelectSample(sample)}
              className="group text-left bg-white border border-slate-200 hover:border-sky-500 rounded-xl p-6 transition-colors flex flex-col justify-between gap-4 cursor-pointer"
            >
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span>{sample.discipline}</span>
                  <span aria-hidden="true">·</span>
                  <span>{LEVEL_LABELS[sample.level]}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{sample.estimatedStudyMinutes} min</span>
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                  {sample.subjectTitle}
                </h3>
                <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                  {sample.executiveSummary}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-semibold text-sky-700">
                <span>Abrir sistemas y juegos</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {previewDoc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Vista previa de ${previewDoc.title}`}
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-4">
              <p className="font-display font-semibold text-sm text-slate-900 truncate">
                {previewDoc.title}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewDoc.isBlobUrl ? previewDoc.url : `${previewDoc.url}?download=1`}
                  download={previewDoc.title}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar</span>
                </a>
                <button
                  type="button"
                  onClick={handleClosePreview}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Cerrar vista previa"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <iframe
              src={previewDoc.url}
              title={previewDoc.title}
              className="flex-1 w-full bg-slate-100"
            />
          </div>
        </div>
      )}
    </div>
  );
};
