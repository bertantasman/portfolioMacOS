import { VIRTUAL_FILE_TYPES, type VirtualFile } from "./types";

interface ValidationOptions {
  rootId: string;
  /** Whether a project with this id exists in the project registry. */
  hasProject: (projectId: string) => boolean;
  /** Whether a media record with this id exists. */
  hasMedia?: (mediaId: string) => boolean;
  /** Whether a document record with this id exists. */
  hasDocument?: (documentId: string) => boolean;
  /** Whether a note with this id exists. */
  hasNote?: (noteId: string) => boolean;
}

/** Returns human-readable problems; an empty array means the tree is sound. */
export function validateFileSystem(
  files: readonly VirtualFile[],
  { rootId, hasProject, hasMedia, hasDocument, hasNote }: ValidationOptions,
): string[] {
  const errors: string[] = [];
  const byId = new Map<string, VirtualFile>();

  for (const file of files) {
    if (byId.has(file.id)) errors.push(`Duplicate file id "${file.id}".`);
    byId.set(file.id, file);
  }

  const roots = files.filter((f) => f.parentId === null);
  if (roots.length !== 1 || roots[0].id !== rootId) {
    errors.push(
      `Expected exactly one root with id "${rootId}", found: ${roots.map((r) => `"${r.id}"`).join(", ") || "none"}.`,
    );
  }

  const siblingNames = new Map<string, string>();
  for (const file of files) {
    const label = `"${file.id}"`;

    if (!(VIRTUAL_FILE_TYPES as readonly string[]).includes(file.type)) {
      errors.push(`File ${label} has unsupported type "${file.type}".`);
    }

    if (file.parentId !== null) {
      const parent = byId.get(file.parentId);
      if (!parent) errors.push(`File ${label} references missing parent "${file.parentId}".`);
      else if (parent.type !== "folder") {
        errors.push(`File ${label} has parent "${parent.id}", which is not a folder.`);
      }
      const key = `${file.parentId}\u0000${file.name.toLowerCase()}`;
      const clash = siblingNames.get(key);
      if (clash) errors.push(`Files "${clash}" and ${label} share the name "${file.name}" in "${file.parentId}".`);
      else siblingNames.set(key, file.id);
    }

    if (file.mediaId !== undefined) {
      if (file.type !== "image") errors.push(`Non-image file ${label} must not set mediaId.`);
      else if (hasMedia && !hasMedia(file.mediaId)) {
        errors.push(`Image file ${label} references unknown media "${file.mediaId}".`);
      }
    }

    if (file.documentId !== undefined) {
      if (file.type !== "document") errors.push(`Non-document file ${label} must not set documentId.`);
      else if (hasDocument && !hasDocument(file.documentId)) {
        errors.push(`Document file ${label} references unknown document "${file.documentId}".`);
      }
    }

    if (file.noteId !== undefined) {
      if (file.type !== "document") errors.push(`Non-document file ${label} must not set noteId.`);
      else if (hasNote && !hasNote(file.noteId)) errors.push(`Document file ${label} references unknown note "${file.noteId}".`);
    }

    if (file.aliasOf !== undefined) {
      const target = byId.get(file.aliasOf);
      if (file.type !== "folder") errors.push(`Non-folder file ${label} must not set aliasOf.`);
      else if (!target || target.type !== "folder") errors.push(`Folder alias ${label} points to "${file.aliasOf}", which is not a folder.`);
      else if (target.aliasOf !== undefined) errors.push(`Folder alias ${label} points to another alias "${file.aliasOf}".`);
    }

    if (file.type === "project") {
      if (!file.projectId) errors.push(`Project file ${label} has no projectId.`);
      else if (!hasProject(file.projectId)) {
        errors.push(`Project file ${label} references unknown project "${file.projectId}".`);
      }
    } else if (file.projectId !== undefined) {
      errors.push(`Non-project file ${label} must not set projectId.`);
    }
  }

  // Cycle detection: walk each chain; a repeat before reaching a root is a cycle.
  const cleared = new Set<string>();
  for (const file of files) {
    const chain = new Set<string>();
    for (let cur: VirtualFile | undefined = file; cur && !cleared.has(cur.id); cur = cur.parentId ? byId.get(cur.parentId) : undefined) {
      if (chain.has(cur.id)) {
        errors.push(`Circular parent relationship involving "${cur.id}".`);
        break;
      }
      chain.add(cur.id);
    }
    chain.forEach((id) => cleared.add(id));
  }

  return errors;
}

export function assertValidFileSystem(files: readonly VirtualFile[], options: ValidationOptions) {
  const errors = validateFileSystem(files, options);
  if (errors.length > 0) {
    throw new Error(`Invalid virtual file system:\n - ${errors.join("\n - ")}`);
  }
}
