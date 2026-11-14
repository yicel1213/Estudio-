import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import multer from 'multer';
import mammoth from 'mammoth';
import { extractText } from 'unpdf';
import path from 'path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { fileURLToPath } from 'url';
import {
  generateDidacticKitFromInput,
  generateAdditionalQuizQuestions,
} from './server/gemini.ts';
import {
  computeBufferHash,
  findCachedKitByHash,
  saveUploadedDocumentToLibrary,
  saveKitOnlyToLibrary,
  listLibraryItems,
  getLibraryFile,
  deleteLibraryItem,
} from './server/libraryStore.ts';
import type { DidacticKit, EducationLevel, LearningFocus } from './src/types/didactic.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
});

const VALID_LEVELS = new Set<EducationLevel>([
  'primaria',
  'secundaria',
  'preparatoria',
  'universidad',
  'autoaprendizaje',
]);

const VALID_FOCUS = new Set<LearningFocus>(['aprender', 'ensenar', 'ambos']);

function parseLevel(val: unknown): EducationLevel {
  if (typeof val === 'string' && VALID_LEVELS.has(val as EducationLevel)) {
    return val as EducationLevel;
  }
  return 'secundaria';
}

function parseFocus(val: unknown): LearningFocus {
  if (typeof val === 'string' && VALID_FOCUS.has(val as LearningFocus)) {
    return val as LearningFocus;
  }
  return 'ambos';
}

function formatApiError(err: unknown): { status: number; message: string; detail?: string } {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg === 'MISSING_API_KEY') {
    return {
      status: 500,
      message:
        'No se encontró la clave GEMINI_API_KEY en el servidor. Verifica la configuración en Settings > Secrets.',
    };
  }
  if (msg === 'PDF_ENCRYPTED') {
    return {
      status: 400,
      message:
        'Este archivo PDF está protegido con contraseña o cifrado. Quítale la contraseña o guárdalo sin bloqueo para procesarlo.',
    };
  }
  if (msg === 'PDF_INVALID') {
    return {
      status: 400,
      message:
        'El archivo no tiene una estructura PDF válida o está dañado. Prueba abrirlo y volver a exportarlo como PDF.',
    };
  }
  if (msg === 'PDF_SCANNED_TOO_LARGE') {
    return {
      status: 400,
      message:
        'Este PDF parece estar escaneado como imágenes y supera 10 MB para lectura visual directa. Comprímelo, divide sus páginas o usa un PDF con texto seleccionable.',
    };
  }
  if (
    /"code"\s*:\s*403\b/.test(msg) ||
    msg.includes('PERMISSION_DENIED') ||
    msg.includes('API_KEY_INVALID')
  ) {
    return {
      status: 403,
      message: 'Error de autenticación con Gemini API. Revisa tu clave en Settings > Secrets.',
    };
  }
  if (
    /"code"\s*:\s*429\b/.test(msg) ||
    /\bstatus\s*[:=]\s*429\b/i.test(msg) ||
    msg.includes('RESOURCE_EXHAUSTED')
  ) {
    return {
      status: 429,
      message: 'Se alcanzó el límite temporal de solicitudes. Intenta nuevamente en unos segundos.',
    };
  }
  if (/"code"\s*:\s*404\b/.test(msg) || msg.includes('NOT_FOUND')) {
    return {
      status: 500,
      message: 'El modelo de análisis no está disponible en este momento.',
    };
  }
  if (msg.includes('INVALID_ARGUMENT') || msg.includes('Unable to process')) {
    return {
      status: 400,
      message:
        'El archivo PDF o documento no pudo interpretarse. Verifica que no esté dañado o protegido con contraseña.',
      detail: msg.slice(0, 200),
    };
  }
  if (msg.includes('NO_CONTENT') || msg.includes('EMPTY_MODEL_RESPONSE')) {
    return {
      status: 400,
      message:
        'El documento no tiene suficiente texto legible para generar los juegos. Prueba con otro archivo o pega el texto.',
    };
  }
  return {
    status: 500,
    message:
      'No se pudo procesar el documento. Asegúrate de que el archivo contenga texto legible y no esté protegido.',
    detail: msg.slice(0, 200),
  };
}

function stripRtf(rtf: string): string {
  return rtf
    .replace(/\\par[d]?/g, '\n')
    .replace(/\{\*?\\[^{}]+}|[{}]|\\\n?[A-Za-z]+\n?(?:-?\d+)?[ ]?/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function stripMarkup(htmlOrXml: string): string {
  return htmlOrXml
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<\/(p|div|li|tr|h[1-6]|w:p|text:p|br)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function cleanExtractedText(raw: string): string {
  return raw
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractReadableBufferText(buffer: Buffer): string {
  const utf8Raw = buffer.toString('utf8');
  if (utf8Raw.trimStart().startsWith('{\\rtf')) {
    const rtfText = cleanExtractedText(stripRtf(utf8Raw));
    if (rtfText.length >= 3) return rtfText;
  }

  if (/<(html|body|w:document|office:document|xml)\b/i.test(utf8Raw.slice(0, 4000))) {
    const markupText = cleanExtractedText(stripMarkup(utf8Raw));
    if (markupText.length >= 3) return markupText;
  }

  // Legacy binary .doc files store main Unicode text in UTF-16LE sequences
  const utf16Raw = buffer.toString('utf16le');
  const utf16Matches = utf16Raw.match(/[\p{L}\p{N}][\p{L}\p{N}\p{P}\p{Z}]{4,}/gu) || [];
  const utf16Text = cleanExtractedText(
    utf16Matches
      .filter((chunk) => /[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]{2,}/.test(chunk))
      .join(' ')
  );

  const utf8Matches = utf8Raw.match(/[\p{L}\p{N}][\p{L}\p{N}\p{P}\p{Z}\n]{4,}/gu) || [];
  const utf8Text = cleanExtractedText(
    utf8Matches
      .filter((chunk) => /[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]{2,}/.test(chunk))
      .join(' ')
  );

  return utf16Text.length > utf8Text.length ? utf16Text : utf8Text;
}

function hasPdfMagicHeader(buffer: Buffer): boolean {
  const head = buffer.subarray(0, 4096).toString('latin1');
  return head.includes('%PDF-');
}

interface StreamResponder {
  isStream: boolean;
  sendProgress: (stage: string, message: string, percent: number) => void;
  sendKit: (kit: unknown) => Response | void;
  sendError: (status: number, error: string, detail?: string) => Response | void;
  cleanup: () => void;
}

function createStreamResponder(req: Request, res: Response): StreamResponder {
  const acceptsSse = req.headers.accept?.includes('text/event-stream');
  const wantsStream = req.query.stream === '1' || Boolean(acceptsSse);

  if (!wantsStream) {
    return {
      isStream: false,
      sendProgress: () => {},
      sendKit: (kit) => res.json({ kit }),
      sendError: (status, error, detail) => res.status(status).json({ error, detail }),
      cleanup: () => {},
    };
  }

  res.status(200);
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  let closed = false;
  res.on('close', () => {
    if (!res.writableFinished) {
      closed = true;
      clearInterval(heartbeat);
    }
  });

  const writeEvent = (eventName: string, payload: unknown) => {
    if (closed || res.writableEnded) return;
    res.write(`event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`);
  };

  const heartbeat = setInterval(() => {
    if (closed || res.writableEnded) {
      clearInterval(heartbeat);
      return;
    }
    res.write(': keepalive\n\n');
  }, 2500);

  return {
    isStream: true,
    sendProgress: (stage, message, percent) => {
      writeEvent('progress', { stage, message, percent });
    },
    sendKit: (kit) => {
      clearInterval(heartbeat);
      writeEvent('complete', { kit });
      if (!res.writableEnded) res.end();
    },
    sendError: (status, error, detail) => {
      clearInterval(heartbeat);
      writeEvent('error', { status, error, detail });
      if (!res.writableEnded) res.end();
    },
    cleanup: () => {
      clearInterval(heartbeat);
    },
  };
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

const TMP_UPLOAD_DIR = path.resolve(process.cwd(), 'data', 'tmp');

function sanitizeUploadId(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '');
  return cleaned.length >= 6 && cleaned.length <= 80 ? cleaned : null;
}

async function processUploadedDocument(params: {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  level: EducationLevel;
  focus: LearningFocus;
  responder: StreamResponder;
  filePathOnDisk?: string;
}) {
  const { buffer, originalName, mimeType, level, focus, responder, filePathOnDisk } = params;
  const ext = path.extname(originalName).toLowerCase();
  const isPdfBySignature = hasPdfMagicHeader(buffer);
  const isPdf =
    ext === '.pdf' ||
    mimeType === 'application/pdf' ||
    mimeType === 'application/x-pdf' ||
    isPdfBySignature;

  const sendAndSaveKit = async (
    sourceType: 'pdf' | 'word' | 'texto',
    kit: DidacticKit
  ) => {
    try {
      const saved = await saveUploadedDocumentToLibrary({
        fileName: originalName,
        mimeType: mimeType || (isPdf ? 'application/pdf' : 'application/octet-stream'),
        buffer,
        sourceType,
        kit,
      });
      return responder.sendKit(saved.kit);
    } catch (saveErr) {
      console.warn('Could not persist uploaded file to library:', saveErr);
      return responder.sendKit(kit);
    }
  };

  responder.sendProgress('reading', `Recibido "${originalName}". Leyendo contenido...`, 12);

  // Check SHA-256 cache to return instantly without redundant API calls
  const fileHash = computeBufferHash(buffer);
  const cachedKit = await findCachedKitByHash(fileHash, level, focus);
  if (cachedKit) {
    responder.sendProgress('generating', 'Archivo reconocido. Abriendo sistemas didácticos...', 92);
    return responder.sendKit(cachedKit);
  }

  if (isPdf) {
    responder.sendProgress('extracting', 'Extrayendo texto y estructura del PDF...', 22);

    let extractedPdfText = '';
    let totalPages = 1;

    try {
      const pdfResult = await extractText(new Uint8Array(buffer), { mergePages: true });
      totalPages = Math.max(1, Number(pdfResult.totalPages) || 1);
      const rawText = Array.isArray(pdfResult.text)
        ? pdfResult.text.join('\n')
        : typeof pdfResult.text === 'string'
        ? pdfResult.text
        : '';
      extractedPdfText = cleanExtractedText(rawText);
    } catch (pdfErr: unknown) {
      const errName =
        pdfErr && typeof pdfErr === 'object' && 'name' in pdfErr
          ? String((pdfErr as { name?: unknown }).name)
          : '';
      const errMsg = pdfErr instanceof Error ? pdfErr.message : String(pdfErr);
      const lowerMsg = errMsg.toLowerCase();

      if (
        errName === 'PasswordException' ||
        lowerMsg.includes('password') ||
        lowerMsg.includes('encrypted')
      ) {
        throw new Error('PDF_ENCRYPTED');
      }
      console.warn('unpdf extraction warning, trying Gemini PDF multimodal or text fallback:', pdfErr);
    }

    const looksLikeScannedMultiPage =
      totalPages > 1 && extractedPdfText.length < totalPages * 35;

    if (extractedPdfText.length >= 3 && !looksLikeScannedMultiPage) {
      responder.sendProgress(
        'generating',
        `Texto extraído (${totalPages} ${totalPages === 1 ? 'página' : 'páginas'}). Creando sistemas didácticos...`,
        30
      );
      const kit = await generateDidacticKitFromInput({
        fileName: originalName,
        sourceType: 'pdf',
        level,
        focus,
        extractedText: extractedPdfText,
        onProgress: (ev) => responder.sendProgress(ev.stage, ev.message, ev.percent),
      });
      return await sendAndSaveKit('pdf', kit);
    }

    // Fallback to Gemini native multimodal PDF (Files API for large PDFs, inlineData for small PDFs)
    responder.sendProgress(
      'generating',
      'PDF visual o escaneado. Leyendo contenido directamente...',
      28
    );

    let tempPdfPath: string | undefined;
    try {
      const useFilesApi = buffer.length > 10 * 1024 * 1024;
      if (useFilesApi) {
        if (filePathOnDisk) {
          tempPdfPath = filePathOnDisk;
        } else {
          await fs.mkdir(TMP_UPLOAD_DIR, { recursive: true });
          tempPdfPath = path.join(TMP_UPLOAD_DIR, `scan-${Date.now()}-${crypto.randomBytes(3).toString('hex')}.pdf`);
          await fs.writeFile(tempPdfPath, buffer);
        }
      }

      const kit = await generateDidacticKitFromInput({
        fileName: originalName,
        sourceType: 'pdf',
        level,
        focus,
        ...(useFilesApi ? { pdfFilePath: tempPdfPath } : { pdfBase64: buffer.toString('base64') }),
        onProgress: (ev) => responder.sendProgress(ev.stage, ev.message, ev.percent),
      });
      return await sendAndSaveKit('pdf', kit);
    } catch (multimodalErr) {
      if (extractedPdfText.length >= 3) {
        const kit = await generateDidacticKitFromInput({
          fileName: originalName,
          sourceType: 'pdf',
          level,
          focus,
          extractedText: extractedPdfText,
          onProgress: (ev) => responder.sendProgress(ev.stage, ev.message, ev.percent),
        });
        return await sendAndSaveKit('pdf', kit);
      }
      throw multimodalErr;
    } finally {
      if (tempPdfPath && tempPdfPath !== filePathOnDisk) {
        await fs.unlink(tempPdfPath).catch(() => undefined);
      }
    }
  }

  if (
    ext === '.docx' ||
    ext === '.docm' ||
    ext === '.dotx' ||
    mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    responder.sendProgress('extracting', 'Extrayendo texto del documento Word...', 22);
    let extractedText = '';
    try {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = cleanExtractedText(result.value || '');
    } catch (docxErr) {
      console.warn('Mammoth .docx parse warning, trying fallback Word extractors:', docxErr);
    }

    if (extractedText.length < 3) {
      extractedText = extractReadableBufferText(buffer);
    }

    if (extractedText.length < 3) {
      return responder.sendError(400, 'El documento Word no contiene texto legible.');
    }

    const kit = await generateDidacticKitFromInput({
      fileName: originalName,
      sourceType: 'word',
      level,
      focus,
      extractedText,
      onProgress: (ev) => responder.sendProgress(ev.stage, ev.message, ev.percent),
    });
    return await sendAndSaveKit('word', kit);
  }

  if (ext === '.rtf' || mimeType === 'application/rtf' || mimeType === 'text/rtf') {
    const cleaned = cleanExtractedText(stripRtf(buffer.toString('utf-8')));
    if (cleaned.length < 3) {
      return responder.sendError(400, 'El documento RTF no contiene texto legible.');
    }
    const kit = await generateDidacticKitFromInput({
      fileName: originalName,
      sourceType: 'word',
      level,
      focus,
      extractedText: cleaned,
      onProgress: (ev) => responder.sendProgress(ev.stage, ev.message, ev.percent),
    });
    return await sendAndSaveKit('word', kit);
  }

  if (ext === '.doc' || mimeType === 'application/msword') {
    responder.sendProgress('extracting', 'Extrayendo texto del documento Word (.doc)...', 22);
    let extractedText = '';
    try {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = cleanExtractedText(result.value || '');
    } catch {
      // Not a docx-in-disguise, proceed to binary/RTF/HTML extractors
    }

    if (extractedText.length < 3) {
      extractedText = extractReadableBufferText(buffer);
    }

    if (extractedText.length < 3) {
      return responder.sendError(
        400,
        'No se encontró texto legible dentro de este archivo .doc.'
      );
    }
    const kit = await generateDidacticKitFromInput({
      fileName: originalName,
      sourceType: 'word',
      level,
      focus,
      extractedText,
      onProgress: (ev) => responder.sendProgress(ev.stage, ev.message, ev.percent),
    });
    return await sendAndSaveKit('word', kit);
  }

  if (
    ext === '.txt' ||
    ext === '.md' ||
    ext === '.csv' ||
    ext === '.html' ||
    ext === '.htm' ||
    mimeType.startsWith('text/')
  ) {
    const raw = buffer.toString('utf-8');
    const extractedText = cleanExtractedText(
      ext === '.html' || ext === '.htm' ? stripMarkup(raw) : raw
    );
    if (extractedText.length < 3) {
      return responder.sendError(400, 'El archivo está vacío o sin texto legible.');
    }
    const kit = await generateDidacticKitFromInput({
      fileName: originalName,
      sourceType: 'texto',
      level,
      focus,
      extractedText,
      onProgress: (ev) => responder.sendProgress(ev.stage, ev.message, ev.percent),
    });
    return await sendAndSaveKit('texto', kit);
  }

  // Universal fallback for any other document (.odt, .pages, files without extension, etc.)
  responder.sendProgress('extracting', `Leyendo contenido de "${originalName}"...`, 22);
  let universalText = '';
  try {
    const result = await mammoth.extractRawText({ buffer });
    universalText = cleanExtractedText(result.value || '');
  } catch {
    // ignore and try text extractors
  }

  if (universalText.length < 3) {
    universalText = extractReadableBufferText(buffer);
  }

  if (universalText.length >= 3) {
    const kit = await generateDidacticKitFromInput({
      fileName: originalName,
      sourceType: 'word',
      level,
      focus,
      extractedText: universalText,
      onProgress: (ev) => responder.sendProgress(ev.stage, ev.message, ev.percent),
    });
    return await sendAndSaveKit('word', kit);
  }

  return responder.sendError(
    400,
    'No se pudo extraer texto legible de este archivo. Prueba guardándolo como PDF o .docx.'
  );
}

app.post(
  '/api/upload-chunk',
  express.raw({ type: 'application/octet-stream', limit: '10mb' }),
  async (req, res) => {
    try {
      const uploadId = sanitizeUploadId(req.headers['x-upload-id']);
      const chunkIndex = Number(req.headers['x-chunk-index']);
      const chunkBuf = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);

      if (!uploadId || !Number.isInteger(chunkIndex) || chunkIndex < 0) {
        return res.status(400).json({ error: 'Fragmento de subida inválido.' });
      }
      if (chunkBuf.length === 0) {
        return res.status(400).json({ error: 'El fragmento recibido está vacío.' });
      }

      await fs.mkdir(TMP_UPLOAD_DIR, { recursive: true });
      const tmpPath = path.join(TMP_UPLOAD_DIR, `${uploadId}.part`);
      if (chunkIndex === 0) {
        await fs.writeFile(tmpPath, chunkBuf);
      } else {
        await fs.appendFile(tmpPath, chunkBuf);
      }

      return res.json({ ok: true, chunkIndex, receivedBytes: chunkBuf.length });
    } catch (err) {
      console.error('Error receiving upload chunk:', err);
      return res.status(500).json({ error: 'No se pudo recibir el fragmento del archivo.' });
    }
  }
);

app.post('/api/analyze-uploaded', async (req, res) => {
  const responder = createStreamResponder(req, res);
  let tmpPath = '';

  try {
    const uploadId = sanitizeUploadId(req.body?.uploadId);
    const originalName =
      typeof req.body?.fileName === 'string' && req.body.fileName.trim()
        ? req.body.fileName.trim()
        : 'documento.pdf';
    const mimeType =
      typeof req.body?.mimeType === 'string' ? req.body.mimeType : 'application/octet-stream';
    const level = parseLevel(req.body?.level);
    const focus = parseFocus(req.body?.focus);

    if (!uploadId) {
      return responder.sendError(400, 'Identificador de subida inválido.');
    }

    tmpPath = path.join(TMP_UPLOAD_DIR, `${uploadId}.part`);
    let buffer: Buffer;
    try {
      buffer = await fs.readFile(tmpPath);
    } catch {
      return responder.sendError(400, 'No se encontró el archivo ensamblado en el servidor.');
    }

    if (buffer.length === 0) {
      return responder.sendError(400, 'El archivo subido está vacío (0 bytes).');
    }

    return await processUploadedDocument({
      buffer,
      originalName,
      mimeType,
      level,
      focus,
      responder,
      filePathOnDisk: tmpPath,
    });
  } catch (err) {
    console.error('Error analyzing chunked upload:', err);
    const { status, message, detail } = formatApiError(err);
    return responder.sendError(status, message, detail);
  } finally {
    if (tmpPath) {
      await fs.unlink(tmpPath).catch(() => undefined);
    }
    responder.cleanup();
  }
});

app.post('/api/analyze-document', upload.single('file'), async (req, res) => {
  const responder = createStreamResponder(req, res);

  try {
    const file = req.file;
    const level = parseLevel(req.body?.level);
    const focus = parseFocus(req.body?.focus);

    if (!file) {
      return responder.sendError(
        400,
        'Adjunta un archivo PDF o Word (.docx) antes de generar.'
      );
    }

    if (file.size === 0 || !file.buffer || file.buffer.length === 0) {
      return responder.sendError(400, 'El archivo seleccionado está vacío (0 bytes).');
    }

    return await processUploadedDocument({
      buffer: file.buffer,
      originalName: file.originalname || 'documento',
      mimeType: file.mimetype || 'application/octet-stream',
      level,
      focus,
      responder,
    });
  } catch (err) {
    console.error('Error analyzing document:', err);
    const { status, message, detail } = formatApiError(err);
    return responder.sendError(status, message, detail);
  } finally {
    responder.cleanup();
  }
});

app.post('/api/analyze-text', async (req, res) => {
  const responder = createStreamResponder(req, res);

  try {
    const rawText = typeof req.body?.text === 'string' ? cleanExtractedText(req.body.text) : '';
    const title =
      typeof req.body?.title === 'string' && req.body.title.trim()
        ? req.body.title.trim()
        : 'Apuntes_de_Clase.txt';
    const level = parseLevel(req.body?.level);
    const focus = parseFocus(req.body?.focus);

    if (rawText.length < 5) {
      return responder.sendError(
        400,
        'Escribe o pega al menos unas palabras de la materia para generar los sistemas didácticos.'
      );
    }

    responder.sendProgress(
      'generating',
      'Analizando tus apuntes y estructurando los juegos...',
      25
    );

    const kit = await generateDidacticKitFromInput({
      fileName: title,
      sourceType: 'texto',
      level,
      focus,
      extractedText: rawText,
      onProgress: (ev) => responder.sendProgress(ev.stage, ev.message, ev.percent),
    });

    try {
      const saved = await saveKitOnlyToLibrary(kit);
      return responder.sendKit(saved.kit);
    } catch {
      return responder.sendKit(kit);
    }
  } catch (err) {
    console.error('Error analyzing pasted text:', err);
    const { status, message, detail } = formatApiError(err);
    return responder.sendError(status, message, detail);
  } finally {
    responder.cleanup();
  }
});

app.post('/api/expand-quiz', async (req, res) => {
  try {
    const subjectTitle = String(req.body?.subjectTitle || 'Materia').trim();
    const discipline = String(req.body?.discipline || 'General').trim();
    const level = parseLevel(req.body?.level);
    const sourceTextContext = String(req.body?.sourceTextContext || '').trim();
    const existingQuestions = Array.isArray(req.body?.existingQuestions)
      ? req.body.existingQuestions.map(String)
      : [];
    const neededCount = Math.min(25, Math.max(1, Number(req.body?.neededCount) || 10));

    if (!sourceTextContext) {
      return res.status(400).json({
        error: 'No hay contexto suficiente del documento para generar más preguntas.',
      });
    }

    const questions = await generateAdditionalQuizQuestions({
      subjectTitle,
      discipline,
      level,
      sourceTextContext,
      existingQuestions,
      neededCount,
    });

    return res.json({ questions });
  } catch (err) {
    console.error('Error expanding quiz:', err);
    const { status, message, detail } = formatApiError(err);
    return res.status(status).json({ error: message, detail });
  }
});

app.get('/api/library', async (_req, res) => {
  try {
    const items = await listLibraryItems();
    return res.json({ items });
  } catch (err) {
    console.error('Error listing library:', err);
    return res.status(500).json({ error: 'No se pudo cargar la biblioteca guardada.' });
  }
});

app.post('/api/library', async (req, res) => {
  try {
    const kit = req.body?.kit as DidacticKit | undefined;
    if (!kit || !kit.subjectTitle) {
      return res.status(400).json({ error: 'Datos del kit didáctico inválidos.' });
    }
    const item = await saveKitOnlyToLibrary(kit);
    return res.json({ item });
  } catch (err) {
    console.error('Error saving kit to library:', err);
    return res.status(500).json({ error: 'No se pudo guardar en la biblioteca.' });
  }
});

app.get('/api/library/:id/file', async (req, res) => {
  try {
    const found = await getLibraryFile(req.params.id);
    if (!found) {
      return res.status(404).json({ error: 'Archivo guardado no encontrado.' });
    }
    const disposition = req.query.download === '1' ? 'attachment' : 'inline';
    const encodedName = encodeURIComponent(found.record.fileName);
    res.setHeader('Content-Type', found.record.mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `${disposition}; filename*=UTF-8''${encodedName}`
    );
    return res.sendFile(found.filePath);
  } catch (err) {
    console.error('Error serving saved file:', err);
    return res.status(500).json({ error: 'No se pudo abrir el archivo guardado.' });
  }
});

app.delete('/api/library/:id', async (req, res) => {
  try {
    const removed = await deleteLibraryItem(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: 'Elemento no encontrado en la biblioteca.' });
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error('Error deleting library item:', err);
    return res.status(500).json({ error: 'No se pudo eliminar el archivo.' });
  }
});

// Ensure Multer and JSON middleware errors always return clean JSON instead of HTML
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Express upload/middleware error:', err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error: `Error al recibir el archivo (${err.code}). Intenta subirlo nuevamente.`,
    });
  }
  return res.status(500).json({
    error: 'Ocurrió un error al recibir el archivo en el servidor.',
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AulaViva server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
