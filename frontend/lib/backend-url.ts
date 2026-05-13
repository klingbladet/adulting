const isServer = typeof window === 'undefined';

export const BACKEND_URL = isServer
  ? (process.env.BACKEND_URL || "http://backend:3001")
  : (process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:3001");
