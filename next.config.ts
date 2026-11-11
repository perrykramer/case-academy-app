import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // CA-001 was a duplicate of CA-003 (Fruit Drink Co.) and was removed.
      { source: "/library/CA-001", destination: "/library/CA-003", permanent: true },
    ];
  },
};

export default nextConfig;
