import type { ProjectCategoryId } from "@/data/project-categories";
import type { GitHubRepository } from "./types";

/**
 * Conservative classification from real topics. A Swift repository is not assumed to be an iOS app, nor a
 * Python one an AI project: when nothing explicit says so, the answer is "other".
 */
const TOPIC_CATEGORIES: [ProjectCategoryId, readonly string[]][] = [
  ["ios-development", ["ios", "iphone", "ipad", "swiftui", "uikit", "xcode"]],
  ["android-development", ["android", "jetpack-compose", "android-app", "kotlin-android"]],
  ["artificial-intelligence", ["artificial-intelligence", "machine-learning", "deep-learning", "ai", "llm", "nlp", "computer-vision", "neural-network", "tensorflow", "pytorch"]],
  ["web-development", ["web", "website", "frontend", "front-end", "react", "nextjs", "next-js", "vue", "angular", "svelte", "tailwindcss", "webapp", "web-app", "portfolio-website"]],
  ["backend-development", ["backend", "back-end", "api", "rest-api", "graphql", "server", "express", "nodejs", "django", "flask", "fastapi", "spring-boot", "microservices"]],
];

export function classifyRepository(repo: GitHubRepository): ProjectCategoryId {
  const topics = new Set(repo.topics.map((t) => t.toLowerCase()));
  for (const [category, keywords] of TOPIC_CATEGORIES) {
    if (keywords.some((k) => topics.has(k))) return category;
  }
  // A site written only in HTML/CSS is the one language signal that is reliable on its own.
  if (repo.primaryLanguage === "HTML" || repo.primaryLanguage === "CSS") return "web-development";
  return "other";
}
