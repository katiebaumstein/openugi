import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // Self-hosting: emit .next/standalone with trimmed node_modules + server.js.
  // Deploy artifact = standalone/ + .next/static + public/ ; no npm install on server.
  output: "standalone",
  images: {
    formats: ["image/webp"],
  },
};

export default withNextIntl(nextConfig);
