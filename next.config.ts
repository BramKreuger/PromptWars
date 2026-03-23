import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Socket.io requires custom server; we'll use a custom server in production
  // For dev, we proxy WebSocket connections
};

export default nextConfig;
