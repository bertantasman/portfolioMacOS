import { getFileKind } from "@/lib/virtual-fs/kind";
import type { VirtualFile } from "@/lib/virtual-fs/types";

interface IconProps {
  className?: string;
}

/** macOS-style blue folder. Flat fills only, so it renders even inside hidden trees. */
export function FolderIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 52" aria-hidden className={className}>
      <path
        d="M4 8a5 5 0 0 1 5-5h14.5a5 5 0 0 1 3.6 1.5l2.8 2.9A3 3 0 0 0 32 8.5h23a5 5 0 0 1 5 5V44a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"
        fill="#3b9de8"
      />
      <path d="M4 17a5 5 0 0 1 5-5h46a5 5 0 0 1 5 5v27a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" fill="#6cc3f7" />
      <path d="M9 12h46a5 5 0 0 1 5 5v1H4v-1a5 5 0 0 1 5-5z" fill="#fff" fillOpacity=".35" />
    </svg>
  );
}

function Page({ children, className }: IconProps & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 52 64" aria-hidden className={className}>
      <path
        d="M6 4a3 3 0 0 1 3-3h26l15 15v44a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z"
        fill="#fff"
        stroke="#c4c4c8"
        strokeWidth="1.5"
      />
      <path d="M35 1v11a4 4 0 0 0 4 4h11z" fill="#e3e3e7" stroke="#c4c4c8" strokeWidth="1.5" strokeLinejoin="round" />
      {children}
    </svg>
  );
}

/** Generic document page. */
export function DocumentIcon({ className }: IconProps) {
  return (
    <Page className={className}>
      <path d="M14 30h24M14 37h24M14 44h16" stroke="#c4c4c8" strokeWidth="2" strokeLinecap="round" />
    </Page>
  );
}

export function PdfIcon({ className }: IconProps) {
  return (
    <Page className={className}>
      <rect x="6.75" y="36" width="38.5" height="14" rx="2" fill="#e8453c" />
      <text x="26" y="46.4" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#fff" fontFamily="system-ui, sans-serif">
        PDF
      </text>
    </Page>
  );
}

export function ImageIcon({ className }: IconProps) {
  return (
    <Page className={className}>
      <rect x="13" y="28" width="26" height="20" rx="2" fill="#7cc8f5" />
      <path d="M13 44l8-8 6 6 5-4 7 7v3a2 2 0 0 1-2 2H15a2 2 0 0 1-2-2z" fill="#5cb85c" />
      <circle cx="33" cy="33" r="2.5" fill="#fff" />
    </Page>
  );
}

/** A project: a purple tile with code brackets, distinct from plain documents. */
export function ProjectIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={className}>
      <rect x="4" y="4" width="56" height="56" rx="14" fill="#6e5bf0" />
      <rect x="4" y="4" width="56" height="28" rx="14" fill="#fff" fillOpacity=".12" />
      <path
        d="M26 22L16 32l10 10M38 22l10 10-10 10"
        fill="none"
        stroke="#fff"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ApplicationIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={className}>
      <rect x="4" y="4" width="56" height="56" rx="14" fill="#8e929b" />
      <rect x="4" y="4" width="56" height="28" rx="14" fill="#fff" fillOpacity=".18" />
      <path d="M32 14l-14 34M32 14l14 34M23 38h18" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The startup volume shown on the desktop. */
export function VolumeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 48" aria-hidden className={className}>
      <rect x="3" y="8" width="58" height="32" rx="7" fill="#9a9ea8" />
      <rect x="3" y="8" width="58" height="16" rx="7" fill="#fff" fillOpacity=".25" />
      <rect x="3" y="30" width="58" height="10" rx="5" fill="#6d717b" />
      <circle cx="52" cy="35" r="2" fill="#7de08a" />
    </svg>
  );
}

/** Chooses the icon from the file's type (and extension for documents). */
export function FileTypeIcon({ file, className }: { file: VirtualFile; className?: string }) {
  switch (file.type) {
    case "folder":
      return file.kind === "Volume" ? <VolumeIcon className={className} /> : <FolderIcon className={className} />;
    case "project":
      return <ProjectIcon className={className} />;
    case "image":
      return <ImageIcon className={className} />;
    case "application":
      return <ApplicationIcon className={className} />;
    case "document":
      return getFileKind(file) === "PDF Document" ? (
        <PdfIcon className={className} />
      ) : (
        <DocumentIcon className={className} />
      );
  }
}
