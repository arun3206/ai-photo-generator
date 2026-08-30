import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/api/templates/**/*": ["./templates/**/*"],
    "/api/generations/**/*": ["./templates/**/*"],
  },
};

export default nextConfig;
