declare module "next-pwa" {
  import type { NextConfig } from "next";

  type PWAOptions = {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    buildExcludes?: RegExp[];
    fallbacks?: Record<string, string>;
    cacheOnFrontEndNav?: boolean;
    reloadOnOnline?: boolean;
    workboxOptions?: Record<string, unknown>;
  };

  export default function withPWA(options?: PWAOptions): (nextConfig: NextConfig) => NextConfig;
}
