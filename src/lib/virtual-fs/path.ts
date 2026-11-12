import { terminalConfig } from "@/config/terminal";
import type { VirtualFileSystem } from "./filesystem";

/**
 * The absolute virtual path of an item, in the same form Terminal's `pwd` shows
 * (e.g. "/Users/bertan/Documents/Resume.pdf"). It is cosmetic: nothing real is at this location.
 */
export function getVirtualPath(fs: VirtualFileSystem, id: string): string {
  const names = fs.getPath(id).slice(1).map((f) => f.name);
  return [terminalConfig.homePath, ...names].join("/");
}
