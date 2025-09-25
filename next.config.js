const { CODESPACE_NAME, GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN } = process.env;

const allowedOriginHosts = ["localhost:3000", "127.0.0.1:3000", "[::1]:3000"];

if (CODESPACE_NAME && GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN) {
  allowedOriginHosts.push(`${CODESPACE_NAME}-3000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`);
  allowedOriginHosts.push(`*.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: allowedOriginHosts
    }
  }
};

module.exports = nextConfig;
