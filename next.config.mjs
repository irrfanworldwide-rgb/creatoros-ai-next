/** @type {import('next').NextConfig} */
const securityHeaders = [
  // Prevents this app from being embedded in a hidden <iframe> on another
  // site (clickjacking protection on the auth modal / payment flow).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Stops browsers from guessing content types away from what's declared.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak the full referring URL (which could contain auth tokens in
  // query strings during OAuth redirects) to third-party destinations.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features this app never uses.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // don't advertise "X-Powered-By: Next.js"
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
