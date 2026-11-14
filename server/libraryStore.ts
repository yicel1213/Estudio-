import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import type {
  DidacticKit,
  EducationLevel,
  LearningFocus,
  SavedLibraryItem,
} from '../src/types/didactic.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const INDEX_FILE = path.join(DATA_DIR, 'library.json');

interface StoredRecord {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  sourceType: 'pdf' | 'word' | 'texto' | 'ejemplo';
  storedFileName: string;
  sha256: string;
  savedAt: string;
  kit: DidacticKit;
}

let writeQueue: Promise<void> = Promise.resolve();

async function ensureDirs() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

async function readIndex(): Promise<StoredRecord[]> {
  await ensureDirs();
  try {
    const raw = await fs.readFile(INDEX_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeIndex(records: StoredRecord[]): Promise<void> {
  await ensureDirs();
  const tmpPath = `${INDEX_FILE}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(records, null, 2), 'utf-8');
  await fs.rename(tmpPath, INDEX_FILE);
}

function withWriteLock<T>(fn: () => Promise<T>): Promise<T> {
  const next = writeQueue.then(fn, fn);
  writeQueue = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

export function computeBufferHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export async function computeFileHash(filePath: string): Promise<string> {
  const buf = await fs.readFile(filePath);
  return computeBufferHash(buf);
}

export async function findCachedKitByHash(
  sha256: string,
  level: EducationLevel,
  focus: LearningFocus
): Promise<DidacticKit | null> {
  const records = await readIndex();
  const match = records.find(
    (r) => r.sha256 === sha256 && r.kit?.level === level && r.kit?.focus === focus
  );
  if (!match) return null;
  return {
    ...match.kit,
    id: `kit-${Date.now()}`,
    libraryId: match.id,
    savedAt: match.savedAt,
  };
}

export async function saveUploadedDocumentToLibrary(params: {
  fileName: string;
  mimeType: string;
  buffer: Buffer;
  sourceType: 'pdf' | 'word' | 'texto';
  kit: DidacticKit;
}): Promise<SavedLibraryItem> {
  return withWriteLock(async () => {
    const records = await readIndex();
    const id = `doc-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const safeExt = path.extname(params.fileName).replace(/[^a-zA-Z0-9.]/g, '').slice(0, 12) || '.bin';
    const storedFileName = `${id}${safeExt}`;
    const storedPath = path.join(UPLOADS_DIR, storedFileName);
    const sha256 = computeBufferHash(params.buffer);
    const savedAt = new Date().toISOString();

    await ensureDirs();
    await fs.writeFile(storedPath, params.buffer);

    const enrichedKit: DidacticKit = {
      ...params.kit,
      libraryId: id,
      savedAt,
    };

    const record: StoredRecord = {
      id,
      fileName: params.fileName,
      mimeType: params.mimeType || 'application/octet-stream',
      fileSize: params.buffer.length,
      sourceType: params.sourceType,
      storedFileName,
      sha256,
      savedAt,
      kit: enrichedKit,
    };

    const updated = [record, ...records];
    await writeIndex(updated);

    return {
      id: record.id,
      fileName: record.fileName,
      mimeType: record.mimeType,
      fileSize: record.fileSize,
      sourceType: record.sourceType,
      savedAt: record.savedAt,
      hasOriginalFile: true,
      kit: enrichedKit,
    };
  });
}

export async function saveKitOnlyToLibrary(kit: DidacticKit): Promise<SavedLibraryItem> {
  return withWriteLock(async () => {
    const records = await readIndex();
    const id = kit.libraryId || `doc-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const savedAt = new Date().toISOString();
    const textContent =
      kit.sourceTextContext || `${kit.subjectTitle}\n\n${kit.executiveSummary}\n\n${kit.bigIdea}`;
    const buf = Buffer.from(textContent, 'utf-8');
    const safeName = kit.sourceFileName || `${kit.subjectTitle.slice(0, 40)}.txt`;
    const storedFileName = `${id}.txt`;

    await ensureDirs();
    await fs.writeFile(path.join(UPLOADS_DIR, storedFileName), buf);

    const enrichedKit: DidacticKit = {
      ...kit,
      libraryId: id,
      savedAt,
    };

    const existingIdx = records.findIndex((r) => r.id === id);
    const record: StoredRecord = {
      id,
      fileName: safeName,
      mimeType: 'text/plain; charset=utf-8',
      fileSize: buf.length,
      sourceType: kit.sourceType,
      storedFileName,
      sha256: computeBufferHash(buf),
      savedAt,
      kit: enrichedKit,
    };

    const updated =
      existingIdx >= 0
        ? records.map((r, i) => (i === existingIdx ? record : r))
        : [record, ...records];

    await writeIndex(updated);

    return {
      id: record.id,
      fileName: record.fileName,
      mimeType: record.mimeType,
      fileSize: record.fileSize,
      sourceType: record.sourceType,
      savedAt: record.savedAt,
      hasOriginalFile: true,
      kit: enrichedKit,
    };
  });
}

export async function listLibraryItems(): Promise<SavedLibraryItem[]> {
  const records = await readIndex();
  const items: SavedLibraryItem[] = [];

  for (const r of records) {
    let hasOriginalFile = false;
    if (r.storedFileName) {
      try {
        await fs.access(path.join(UPLOADS_DIR, r.storedFileName));
        hasOriginalFile = true;
      } catch {
        hasOriginalFile = false;
      }
    }
    items.push({
      id: r.id,
      fileName: r.fileName,
      mimeType: r.mimeType,
      fileSize: r.fileSize,
      sourceType: r.sourceType,
      savedAt: r.savedAt,
      hasOriginalFile,
      kit: {
        ...r.kit,
        libraryId: r.id,
        savedAt: r.savedAt,
      },
    });
  }

  return items;
}

export async function getLibraryFile(id: string): Promise<{
  record: StoredRecord;
  filePath: string;
} | null> {
  const records = await readIndex();
  const record = records.find((r) => r.id === id);
  if (!record || !record.storedFileName) return null;

  const filePath = path.join(UPLOADS_DIR, record.storedFileName);
  try {
    await fs.access(filePath);
    return { record, filePath };
  } catch {
    return null;
  }
}

export async function deleteLibraryItem(id: string): Promise<boolean> {
  return withWriteLock(async () => {
    const records = await readIndex();
    const target = records.find((r) => r.id === id);
    if (!target) return false;

    if (target.storedFileName) {
      try {
        await fs.unlink(path.join(UPLOADS_DIR, target.storedFileName));
      } catch {
        // File already removed
      }
    }

    const remaining = records.filter((r) => r.id !== id);
    await writeIndex(remaining);
    return true;
  });
}
