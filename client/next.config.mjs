/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    distDir: "dist",
    // Enable App Router
    appDir: true,
    // Disable image optimization for static export
    images: {
        unoptimized: true,
    },
};

export default nextConfig;

