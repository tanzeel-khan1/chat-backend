const PRODUCTION_FRONTEND = "https://chat-steel-eta.vercel.app";
const PRODUCTION_BACKEND = "https://my-app1111.bonto.run";

export const getFrontendUrl = () =>
  process.env.FRONTEND_URL || PRODUCTION_FRONTEND;

export const getBackendUrl = () =>
  process.env.BACKEND_URL || PRODUCTION_BACKEND;

export const getCorsOrigins = () => [getFrontendUrl()];

export const FRONTEND_URL = PRODUCTION_FRONTEND;
export const BACKEND_URL = PRODUCTION_BACKEND;
export const CORS_ORIGINS = [PRODUCTION_FRONTEND];
