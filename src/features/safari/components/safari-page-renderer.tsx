import type { SafariFavorite } from "../config/safari-favorites";
import type { SafariRoute } from "../config/safari-routes";
import { AboutPage, type AboutAnchor } from "../pages/about-page";
import { ContactPage } from "../pages/contact-page";
import { ProjectsPage } from "../pages/projects-page";
import { SafariStartPage } from "./safari-start-page";

interface SafariPageRendererProps {
  route: SafariRoute;
  visits: Readonly<Partial<Record<SafariRoute, number>>>;
  onOpenFavorite: (favorite: SafariFavorite) => void;
  onOpenRoute: (route: SafariRoute) => void;
  aboutAnchor?: AboutAnchor;
}

/** Maps an internal route to its page. Exhaustive: adding a route fails to compile until handled. */
export function SafariPageRenderer({ route, visits, onOpenFavorite, onOpenRoute, aboutAnchor }: SafariPageRendererProps) {
  switch (route) {
    case "start":
      return <SafariStartPage visits={visits} onOpenFavorite={onOpenFavorite} onOpenRoute={onOpenRoute} />;
    case "about":
      return <AboutPage anchor={aboutAnchor} onOpenProjects={() => onOpenRoute("projects")} />;
    case "projects":
      return <ProjectsPage />;
    case "contact":
      return <ContactPage />;
  }
}
