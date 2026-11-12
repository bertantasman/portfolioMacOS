// Portfolio content audit: `npm run audit` (add `-- --github` to include the live GitHub repositories,
// which needs GITHUB_USERNAME). Read-only; exits 1 when it finds errors.
import { existsSync } from "node:fs";
import path from "node:path";
import { documents } from "@/data/documents";
import { getAllMedia } from "@/data/media";
import { profile } from "@/data/profile";
import { projects as curated } from "@/data/projects";
import { getRepositories } from "@/lib/github/repositories";
import { buildContentAudit, formatContentAudit } from "@/lib/portfolio/audit";
import { validateProjectContent } from "@/lib/projects/maintenance";
import { deriveRegistry } from "@/lib/projects/registry";

const publicDir = path.resolve(process.cwd(), "public");
const withGitHub = process.argv.includes("--github");

let repositories: Parameters<typeof deriveRegistry>[0] = [];
let note = "";
if (withGitHub) {
  const result = await getRepositories();
  if (result.ok) repositories = result.repositories;
  else note = `GitHub: ${result.message} (GitHub-backed content was not checked.)`;
} else {
  note = "GitHub repositories were not fetched. Run with --github to include them.";
}

const registry = deriveRegistry(repositories);
const audit = buildContentAudit({
  registry,
  curated,
  profile,
  media: getAllMedia(),
  documents,
  contentProblems: validateProjectContent(registry),
  fileExists: (publicPath) => existsSync(path.join(publicDir, publicPath)),
  repositoriesLoaded: repositories.length > 0,
});

console.log(formatContentAudit(audit));
if (note) console.log(`\n${note}`);
process.exitCode = audit.issues.some((i) => i.severity === "error") ? 1 : 0;
