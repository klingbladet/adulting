import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    typescript: {
        ignoreBuildErrors: process.env.NEXT_IGNORE_TYPE_ERRORS === `true`,
    },
};

export default nextConfig;
