import type { DidacticKit, SavedLibraryItem } from '../types/didactic';

const DB_NAME = 'aulaviva_library_db';
const DB_VERSION = 1;
const STORE_NAME = 'documents';

interface BrowserStoredDoc {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  sourceType: 'pdf' | 'word' | 'texto' | 'ejemplo';
  savedAt: string;
  kit: DidacticKit;
  fileBlob?: Blob;
}

function openLibraryDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB not available'));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('Failed to open IndexedDB'));
  });
}

async function idbGetAll(): Promise<BrowserStoredDoc[]> {
  try {
    const db = await openLibraryDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(Array.isArray(req.result) ? req.result : []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

async function idbPut(doc: BrowserStoredDoc): Promise<void> {
  try {
    const db = await openLibraryDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(doc);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Ignore storage quota / private mode failures cleanly
  }
}

async function idbGet(id: string): Promise<BrowserStoredDoc | undefined> {
  try {
    const db = await openLibraryDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result as BrowserStoredDoc | undefined);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return undefined;
  }
}

async function idbDelete(id: string): Promise<void> {
  try {
    const db = await openLibraryDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Ignore
  }
}

export async function saveKitAndFileLocally(kit: DidacticKit, file?: File | null): Promise<void> {
  const id = kit.libraryId || kit.id;
  const savedAt = kit.savedAt || new Date().toISOString();
  const doc: BrowserStoredDoc = {
    id,
    fileName: file?.name || kit.sourceFileName,
    mimeType: file?.type || (kit.sourceType === 'pdf' ? 'application/pdf' : 'text/plain'),
    fileSize: file?.size || (kit.sourceTextContext ? kit.sourceTextContext.length : 0),
    sourceType: kit.sourceType,
    savedAt,
    kit: { ...kit, libraryId: id, savedAt },
    fileBlob: file || undefined,
  };
  await idbPut(doc);
}

export async function loadMergedLibrary(): Promise<SavedLibraryItem[]> {
  let serverItems: SavedLibraryItem[] = [];
  try {
    const res = await fetch('/api/library');
    if (res.ok) {
      const data = (await res.json()) as { items?: SavedLibraryItem[] };
      serverItems = Array.isArray(data.items) ? data.items : [];
    }
  } catch {
    // Offline or network hiccup — browser library still works
  }

  const localDocs = await idbGetAll();
  const mergedMap = new Map<string, SavedLibraryItem>();

  for (const item of serverItems) {
    mergedMap.set(item.id, item);
  }

  for (const doc of localDocs) {
    const existing = mergedMap.get(doc.id);
    if (!existing) {
      mergedMap.set(doc.id, {
        id: doc.id,
        fileName: doc.fileName,
        mimeType: doc.mimeType,
        fileSize: doc.fileSize,
        sourceType: doc.sourceType,
        savedAt: doc.savedAt,
        hasOriginalFile: Boolean(doc.fileBlob),
        kit: doc.kit,
      });
    } else if (!existing.hasOriginalFile && doc.fileBlob) {
      mergedMap.set(doc.id, { ...existing, hasOriginalFile: true });
    }
  }

  return Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );
}

export async function resolveSavedFileUrl(item: SavedLibraryItem): Promise<{
  url: string;
  isBlobUrl: boolean;
} | null> {
  const local = await idbGet(item.id);
  if (local?.fileBlob) {
    return {
      url: URL.createObjectURL(local.fileBlob),
      isBlobUrl: true,
    };
  }
  if (item.hasOriginalFile) {
    return {
      url: `/api/library/${encodeURIComponent(item.id)}/file`,
      isBlobUrl: false,
    };
  }
  return null;
}

export async function removeSavedLibraryItem(id: string): Promise<void> {
  await Promise.all([
    idbDelete(id),
    fetch(`/api/library/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => undefined),
  ]);
}
