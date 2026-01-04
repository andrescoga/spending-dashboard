// API configuration for frontend
// Use Vercel function URL in production, localhost for development
export const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'production'
    ? 'https://your-username.vercel.app'  // Replace with your Vercel URL after deployment
    : 'http://localhost:3001');

// Obscure endpoint name for security
export const API_ENDPOINT = '/api/spending-data-a8k3h9x2';
