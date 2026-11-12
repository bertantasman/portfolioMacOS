import type { Metadata, Viewport } from "next";
import { AppProviders } from "@/components/app-providers";
import { accentColors } from "@/config/appearance";
import { siteConfig } from "@/config/site";
import { profile } from "@/data/profile";
import { getSiteUrl } from "@/lib/site-url";
import { STARTUP_STORAGE_KEY } from "@/features/startup/utils/startup-storage";
import { SETTINGS_STORAGE_KEY } from "@/store/settings-store";
import "./globals.css";

const description =
  [profile.fullName ?? profile.displayName, profile.headline].filter(Boolean).join(" — ") + ". An interactive portfolio of projects, background and contact details, presented as a desktop.";
const siteUrl = getSiteUrl();

// What link previews and search results show: the real person and role, from the profile. No image is set,
// because no approved image exists; no URL is assumed, because the production domain is not decided.
export const metadata: Metadata = {
  title: siteConfig.title,
  description,
  applicationName: siteConfig.title,
  authors: [{ name: profile.fullName ?? siteConfig.owner.name }],
  robots: { index: true, follow: true },
  ...(siteUrl ? { metadataBase: siteUrl, alternates: { canonical: "/" } } : {}),
  openGraph: { type: "website", title: siteConfig.title, description, siteName: siteConfig.title, locale: "en", ...(siteUrl ? { url: "/" } : {}) },
  twitter: { card: "summary", title: siteConfig.title, description },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2a1a78",
};

const accentMap = Object.fromEntries(accentColors.map((a) => [a.id, [a.value, a.foreground]]));

const themeScript = `try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(SETTINGS_STORAGE_KEY)})||"null"),t=(s&&s.state)||{},r=document.documentElement,a=t.appearance;if(a==="dark"||(a==="auto"&&matchMedia("(prefers-color-scheme: dark)").matches))r.dataset.theme="dark";var c=${JSON.stringify(accentMap)}[t.accentColor];if(c){r.style.setProperty("--accent-color",c[0]);r.style.setProperty("--accent-fg",c[1])}if(t.reduceMotion===true)r.dataset.reduceMotion="true"}catch(e){}try{var k=${JSON.stringify(STARTUP_STORAGE_KEY)};if(localStorage.getItem(k)!=="1"&&sessionStorage.getItem(k)!=="1")document.documentElement.dataset.startup="pending"}catch(e){document.documentElement.dataset.startup="pending"}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the script below sets attributes before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Applies saved appearance/accent/reduce-motion before first paint to avoid a theme flash. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
