import { RepositoryLoader } from "@/components/repository-loader";
import { AdaptiveShell } from "@/components/shell/adaptive-shell";
import { PortfolioSummary } from "@/components/seo/portfolio-summary";

export default function Home() {
  return (
    <>
      <PortfolioSummary />
      <RepositoryLoader />
      <AdaptiveShell />
    </>
  );
}
