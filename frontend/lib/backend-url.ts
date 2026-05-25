const isServer = typeof window === 'undefined';

export const BACKEND_URL = isServer
  ? (process.env.BACKEND_URL || "http://backend:3001")
  : "/backend";
