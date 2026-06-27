export class APIError extends Error {
  status: number;
  detail: any;

  constructor(status: number, detail: any) {
    const message = typeof detail === 'string' ? detail : JSON.stringify(detail);
    super(message || `API Error ${status}`);
    this.status = status;
    this.detail = detail;
    this.name = 'APIError';
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function apiRequest(path: string, options: RequestInit = {}): Promise<any> {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  
  const headers = new Headers(options.headers);
  
  // Retrieve token from localStorage if in browser environment
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  // Set default Content-Type to JSON if body is not FormData and headers don't specify it
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Prevent infinite redirect loops if already on auth screens
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    throw new APIError(401, 'Unauthorized');
  }

  if (!response.ok) {
    let errorDetail: any = 'An unknown error occurred';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorJson;
    } catch {
      try {
        errorDetail = await response.text();
      } catch {
        // fallback
      }
    }
    throw new APIError(response.status, errorDetail);
  }

  // If response is text/event-stream, return standard response object for chunk reading
  const contentType = response.headers.get('Content-Type');
  if (contentType && contentType.includes('text/event-stream')) {
    return response;
  }

  // Parse response JSON if present
  const text = await response.text();
  if (!text) {
    return null;
  }
  
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const apiGet = (path: string, options: RequestInit = {}) =>
  apiRequest(path, { ...options, method: 'GET' });

export const apiPost = (path: string, body?: any, options: RequestInit = {}) => {
  const isMultipart = body instanceof FormData;
  return apiRequest(path, {
    ...options,
    method: 'POST',
    body: isMultipart ? body : JSON.stringify(body),
  });
};

export const apiDelete = (path: string, options: RequestInit = {}) =>
  apiRequest(path, { ...options, method: 'DELETE' });
