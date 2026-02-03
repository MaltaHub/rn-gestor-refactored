declare module "next-pwa" {
  import type { NextConfig } from "next";

  type PWAConfig = Record<string, unknown>;

  export default function withPWAInit(
    config: PWAConfig
  ): (nextConfig: NextConfig) => NextConfig;
}
