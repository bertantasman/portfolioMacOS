import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    qualities: [90],
    // The GitHub profile picture, from GitHub's own avatar host only.
    remotePatterns: [{ protocol: "https", hostname: "avatars.githubusercontent.com", pathname: "/u/**" }],
  },
  cacheComponents: true,
  // Conservative headers for a public site. A full Content-Security-Policy is not set: the page needs inline
  // scripts and styles (the theme script, motion), so it would need nonces and dynamic rendering. frame-ancestors
  // is safe on its own and blocks clickjacking. Transport security (HSTS) is applied by the hosting platform.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
        ],
      },
    ];
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
