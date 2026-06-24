let baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Clean up trailing slash if present
if (baseUrl.endsWith("/")) {
  baseUrl = baseUrl.slice(0, -1);
}

// Ensure the URL ends with /api
if (!baseUrl.endsWith("/api")) {
  baseUrl = `${baseUrl}/api`;
}

export const API_URL = baseUrl;
