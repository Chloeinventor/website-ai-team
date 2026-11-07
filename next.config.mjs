/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // The built levels live in games-private/ (not public/), read by these routes only.
    outputFileTracingIncludes: {
      "/games/level/[n]": ["./games-private/*"],
      "/api/games/level-data": ["./games-private/*"],
    },
  },
  // "Danmark på kortet" is sold as levels: /games and the old free game pages go to the levels page.
  async redirects() {
    const to = "/games/levels";
    return [
      { source: "/games", destination: to, permanent: false },
      { source: "/games/index.html", destination: to, permanent: false },
      { source: "/games/danish-city-finder.html", destination: to, permanent: false },
      { source: "/games/danish-rail-finder.html", destination: to, permanent: false },
      { source: "/games/danish-rail-finder-sjaelland.html", destination: to, permanent: false },
      { source: "/games/denmark-town-explorer.html", destination: to, permanent: false },
      { source: "/games/denmark-map-master.html", destination: to, permanent: false },
    ];
  },
};

export default nextConfig;
