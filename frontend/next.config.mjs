/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: true,
  // output: "export",
  distDir: "build",
  // images: {
  //   unoptimized: true,
  // },
  // webpack: (config) => {
  //   config.externals.push("bun:sqlite");
  //   return config;
  // },
  webpack: (config, { isServer }) => {
    if (isServer) config.externals.push("bun:sqlite"); // keep it external
    return config;
  },
};

export default nextConfig;
