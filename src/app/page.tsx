import { RepositoryLoader } from "@/components/repository-loader";
import { Desktop } from "@/components/desktop/desktop";
import { PortfolioSummary } from "@/components/seo/portfolio-summary";
import { OnboardingController } from "@/features/onboarding/components/onboarding-controller";
import { StartupController } from "@/features/startup/components/startup-controller";

export default function Home() {
  return (
    <>
      <PortfolioSummary />
      <RepositoryLoader />
      <Desktop />
      <StartupController />
      <OnboardingController />
    </>
  );
}
