import { profile } from "@/data/profile";
import { projects as curatedProjects } from "@/data/projects";
import { repositoryOverrides } from "@/data/github-overrides";
import { projectAnalysis } from "@/data/project-content/analysis";
import { curatedContent } from "@/data/project-content/curated";
import { formatDateRange } from "@/lib/profile/format";
import { getEducation, getExperience, getFullBio, getSkillGroups } from "@/lib/profile/selectors";
import { safeHttpUrl } from "@/lib/safe-url";

/**
 * Contains no links, buttons or other focusable elements, on purpose: it is invisible, so anything focusable in
 * it would be an invisible stop for keyboard users. Links are given to search engines as structured data instead.
 *
 * A plain, server-rendered text version of the portfolio for search engines and assistive technology. The
 * desktop is built in the browser, so without this the page's HTML would hold none of the professional
 * information. It is generated from the same data the apps use (profile, project content, analysis) and holds
 * only what the visitor-facing apps already show: no private CV details, nothing typed in twice.
 */
export function PortfolioSummary() {
  const name = profile.fullName ?? profile.displayName;
  const hidden = new Set(repositoryOverrides.filter((o) => o.hidden && o.repositoryId !== undefined).map((o) => `github:${o.repositoryId}`));
  // Public, original, non-empty repositories that have written descriptions, plus the hand-written projects.
  const projects = [
    ...curatedProjects.map((p) => ({ id: p.id, title: p.title, text: p.shortDescription })),
    ...projectAnalysis
      .filter((a) => a.hasPublicContent && !a.isFork && a.projectType !== "empty" && !hidden.has(a.projectId))
      .flatMap((a) => {
        const c = curatedContent.find((x) => x.projectId === a.projectId);
        return c?.tagline ? [{ id: a.projectId, title: c.displayName ?? a.repositoryName, text: c.tagline }] : [];
      }),
  ];
  const links = (["github", "linkedin", "instagram"] as const).flatMap((p) => {
    const url = safeHttpUrl(profile.socialLinks[p]);
    return url ? [{ label: p[0].toUpperCase() + p.slice(1), url }] : [];
  });
  const skills = getSkillGroups();
  const current = getExperience().find((e) => e.current);
  // schema.org Person, from the same profile data: lets search engines connect the name, role, employer, schools and profiles.
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    ...(profile.headline ? { jobTitle: profile.headline } : {}),
    ...(profile.email ? { email: profile.email } : {}),
    ...(current ? { worksFor: { "@type": "Organization", name: current.organization } } : {}),
    ...(getEducation().length ? { alumniOf: getEducation().map((e) => ({ "@type": "CollegeOrUniversity", name: e.institution })) } : {}),
    ...(links.length ? { sameAs: links.map((l) => l.url) } : {}),
  };

  return (
    <article aria-label={`About ${name}`} className="sr-only">
      {/* "<" is escaped so that no value in the data could ever close the script element. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, "\\u003c") }} />
      <h1>
        {name}
        {profile.headline ? ` — ${profile.headline}` : ""}
      </h1>
      {getFullBio().map((p) => (
        <p key={p}>{p}</p>
      ))}
      {profile.location && <p>Based in {profile.location}.</p>}

      {getEducation().length > 0 && (
        <section>
          <h2>Education</h2>
          <ul>
            {getEducation().map((e) => (
              <li key={e.id}>
                {e.institution}: {[e.degree, e.fieldOfStudy].filter(Boolean).join(", ")} ({formatDateRange(e.startDate, e.graduationDate, e.current)})
              </li>
            ))}
          </ul>
        </section>
      )}

      {getExperience().length > 0 && (
        <section>
          <h2>Experience</h2>
          <ul>
            {getExperience().map((e) => (
              <li key={e.id}>
                {e.role}, {e.organization} ({formatDateRange(e.startDate, e.endDate, e.current)})
              </li>
            ))}
          </ul>
        </section>
      )}

      {skills.length > 0 && (
        <section>
          <h2>Skills</h2>
          <ul>
            {skills.map((g) => (
              <li key={g.id}>
                {g.name}: {g.skills.join(", ")}
              </li>
            ))}
          </ul>
        </section>
      )}

      {projects.length > 0 && (
        <section>
          <h2>Projects</h2>
          <ul>
            {projects.map((p) => (
              <li key={p.id}>
                {p.title}: {p.text}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2>Contact</h2>
        <ul>
          {profile.email && <li>Email: {profile.email}</li>}
          {links.map((l) => (
            <li key={l.label}>
              {l.label}: {l.url}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
