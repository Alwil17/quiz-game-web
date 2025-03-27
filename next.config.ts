import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://sapientia-quiz-game-api.vercel.app/api/:path*",
      },
    ];
  },
};

module.exports = {
  experimental: {
    optimizeFonts: false, // Désactive l'optimisation des polices pour voir si ça règle le problème
    turbopack: false, // Désactive Turbopack
  },
  //   async rewrites() {
  //     return [
  //       {
  //         source: '/api/:path*',
  //         destination: 'https://sapientia-quiz-game-api.vercel.app/api/:path*',
  //       },
  //     ];
  //   },
};

export default nextConfig;
