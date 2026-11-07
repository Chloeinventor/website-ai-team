/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The map games are static pages in public/games; /games opens their start page.
  // A redirect (not a rewrite) so the page's relative links resolve inside /games/.
  async redirects() {
    return [{ source: "/games", destination: "/games/index.html", permanent: false }];
  },
};

export default nextConfig;
