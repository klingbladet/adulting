const isServer = typeof window === 'undefined';

export const SERVER_BACKEND_URL = isServer
  ? (process.env.BACKEND_URL || "http://backend:3001")
  : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001");
