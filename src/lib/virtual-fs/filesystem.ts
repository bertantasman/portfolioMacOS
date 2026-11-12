import type { VirtualFile, VirtualFileType } from "./types";

export interface FileSystemOptions<TProject> {
  rootId: string;
  /** Resolves a project id to its record; keeps this module independent of project data. */
  resolveProject?: (projectId: string) => TProject | undefined;
}

export interface BreadcrumbItem {
  id: string;
  name: string;
}

export interface VirtualFileSystem<TProject = unknown> {
  readonly rootId: string;
  getFile: (id: string) => VirtualFile | undefined;
  /** Direct children, in the order they were declared (use sortFiles to order). */
  getChildren: (folderId: string) => readonly VirtualFile[];
  getParent: (id: string) => VirtualFile | undefined;
  /** Files from the root down to and including `id`. */
  getPath: (id: string) => VirtualFile[];
  getPathString: (id: string, separator?: string) => string;
  getBreadcrumbs: (id: string) => BreadcrumbItem[];
  resolveProject: (file: VirtualFile) => TProject | undefined;
}

export const isFolder = (file: VirtualFile) => file.type === "folder";

export function filterByType(files: readonly VirtualFile[], ...types: VirtualFileType[]) {
  return files.filter((file) => types.includes(file.type));
}

/** Indexes the files once; every lookup afterwards is a map access. */
export function createFileSystem<TProject = never>(
  files: readonly VirtualFile[],
  { rootId, resolveProject }: FileSystemOptions<TProject>,
): VirtualFileSystem<TProject> {
  const byId = new Map<string, VirtualFile>();
  const childrenByParent = new Map<string, VirtualFile[]>();
  for (const file of files) {
    byId.set(file.id, file);
    if (file.parentId === null) continue;
    const siblings = childrenByParent.get(file.parentId);
    if (siblings) siblings.push(file);
    else childrenByParent.set(file.parentId, [file]);
  }

  const getFile = (id: string) => byId.get(id);
  const getParent = (id: string) => {
    const parentId = byId.get(id)?.parentId;
    return parentId ? byId.get(parentId) : undefined;
  };
  const getPath = (id: string) => {
    const path: VirtualFile[] = [];
    const seen = new Set<string>(); // guards against cycles in unvalidated data
    for (let file = byId.get(id); file && !seen.has(file.id); file = getParent(file.id)) {
      seen.add(file.id);
      path.unshift(file);
    }
    return path;
  };

  return {
    rootId,
    getFile,
    // An alias folder lists what the folder it points to contains; the children keep their real parent.
    getChildren: (folderId) => childrenByParent.get(byId.get(folderId)?.aliasOf ?? folderId) ?? [],
    getParent,
    getPath,
    getPathString: (id, separator = " / ") =>
      getPath(id)
        .map((file) => file.name)
        .join(separator),
    getBreadcrumbs: (id) => getPath(id).map(({ id: fileId, name }) => ({ id: fileId, name })),
    resolveProject: (file) =>
      file.projectId !== undefined ? resolveProject?.(file.projectId) : undefined,
  };
}
