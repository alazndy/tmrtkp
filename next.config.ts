import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  
  // Security Headers
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        // Clickjacking protection
        { key: 'X-Frame-Options', value: 'DENY' },
        // MIME type sniffing protection
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        // Referrer policy
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        // Permissions policy
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        // XSS Protection (legacy but still useful)
        { key: 'X-XSS-Protection', value: '1; mode=block' },
      ],
    },
  ],
};

export default nextConfig;
