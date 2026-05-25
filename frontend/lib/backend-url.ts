const isServer = typeof window === 'undefined';

export const getBackendUrl = () => {
  if (isServer) {
    return process.env.BACKEND_URL || "http://backend:3001";
  } else {
    return "/backend"; 
  }
};
