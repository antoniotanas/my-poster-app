import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Avoid trying to bundle native canvas in the browser
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
