/**
 * API utility functions for ShadowLaunch
 */

/**
 * Get the API base URL with /api prefix
 */
export function getApiUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3014';
  return apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
}

/**
 * Fetch wrapper with API base URL
 */
export async function apiFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  const apiBase = getApiUrl();
  const url = endpoint.startsWith('/') ? `${apiBase}${endpoint}` : `${apiBase}/${endpoint}`;
  return fetch(url, options);
}

/**
 * POST to API with JSON body
 */
export async function apiPost<T = any>(endpoint: string, data: any): Promise<{ success: boolean; data?: T; error?: any }> {
  try {
    const response = await apiFetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * GET from API
 */
export async function apiGet<T = any>(endpoint: string): Promise<{ success: boolean; data?: T; error?: any }> {
  try {
    const response = await apiFetch(endpoint);
    return await response.json();
  } catch (error) {
    return { success: false, error };
  }
}
