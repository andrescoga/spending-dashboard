// API configuration for frontend
// Use Vercel function URL in production, localhost for development
export const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'production'
    ? 'https://your-username.vercel.app'  // Replace with your Vercel URL after deployment
    : 'http://localhost:3001');

// Endpoint configuration: obscure in production, normal in development
export const API_ENDPOINT = import.meta.env.MODE === 'production'
  ? '/api/spending-data-a8k3h9x2'  // Obscure endpoint for security in production
  : '/api/spending-data';           // Original endpoint for local development
