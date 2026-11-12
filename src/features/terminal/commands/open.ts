import { line, type Command } from "../types/terminal";
import { posixMessage, resolvePath } from "../utils/path-resolver";

export const open: Command = {
  name: "open",
  description: "Open a project, image, PDF or Mail",
  run: ({ args, env, currentDirectoryId }) => {
    if (args.length === 0) return { output: [line("usage: open <project|image|pdf|Mail>")] };
    if (args.length > 1) return { output: [line("open: too many arguments")] };

    const target = args[0];
    const result = resolvePath(env, currentDirectoryId, target);
    // An application name works when no file or folder has that name.
    if (!result.ok && /^mail(\.app)?$/i.test(target)) {
      env.openMail();
      return {};
    }
    if (!result.ok) return { output: [line(`open: ${target}: ${posixMessage(result.reason)}`)] };

    const { file } = result;
    if (file.type === "project" && file.projectId) {
      env.openProject(file.projectId);
      return {};
    }
    if (file.type === "image" && file.mediaId) {
      env.openMedia(file.mediaId);
      return {};
    }
    if (file.type === "document" && file.documentId) {
      env.openDocument(file.documentId);
      return {};
    }
    if (file.type === "document" && file.noteId) {
      env.openNote(file.noteId);
      return {};
    }
    if (file.type === "folder") {
      // Finder can't be opened at a chosen folder yet; say so rather than pretend.
      return { output: [line(`open: ${target}: opening folders in Finder is not supported yet`)] };
    }
    return { output: [line(`open: ${target}: no application available to open this file yet`)] };
  },
};
