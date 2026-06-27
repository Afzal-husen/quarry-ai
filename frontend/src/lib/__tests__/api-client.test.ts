// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiGet, apiPost, APIError } from '../api-client';

describe('API Client Layer', () => {
  const mockFetch = vi.fn();
  
  beforeEach(() => {
    document.cookie = '';
    vi.stubGlobal('fetch', mockFetch);
    vi.stubGlobal('window', {
      location: {
        pathname: '/dashboard',
        href: 'http://localhost:3000/dashboard',
      },
    });
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
    
    vi.clearAllMocks();
  });

  it('should resolve base url to localhost:8000 and parse JSON response', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      text: async () => JSON.stringify({ success: true }),
    });

    const response = await apiGet('/test-route');
    
    expect(response).toEqual({ success: true });
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/test-route',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('should automatically append Authorization header if token exists in cookies', async () => {
    document.cookie = 'token=mocked-token-456';
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      text: async () => JSON.stringify({ ok: true }),
    });

    await apiGet('/secure-route');

    const calledOptions = mockFetch.mock.calls[0][1] as RequestInit;
    const calledHeaders = calledOptions.headers as Headers;
    expect(calledHeaders.get('Authorization')).toBe('Bearer mocked-token-456');
  });

  it('should serialize custom JSON body for POST requests', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      text: async () => JSON.stringify({ created: true }),
    });

    await apiPost('/create', { name: 'test' });

    const calledOptions = mockFetch.mock.calls[0][1] as RequestInit;
    expect(calledOptions.method).toBe('POST');
    expect(calledOptions.body).toBe(JSON.stringify({ name: 'test' }));
    const calledHeaders = calledOptions.headers as Headers;
    expect(calledHeaders.get('Content-Type')).toBe('application/json');
  });

  it('should throw APIError when response is not ok and expose detail field', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 400,
      ok: false,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => ({ detail: 'Invalid parameters' }),
      text: async () => JSON.stringify({ detail: 'Invalid parameters' }),
    });

    try {
      await apiGet('/bad-route');
      expect.fail('Should have thrown APIError');
    } catch (error: any) {
      expect(error).toBeInstanceOf(APIError);
      expect(error.status).toBe(400);
      expect(error.detail).toBe('Invalid parameters');
      expect(error.message).toBe('Invalid parameters');
    }
  });

  it('should clean up token cookie and redirect to /login on 401 response status code', async () => {
    document.cookie = 'token=expired-token-789';
    mockFetch.mockResolvedValueOnce({
      status: 401,
      ok: false,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      text: async () => JSON.stringify({ detail: 'Token expired' }),
    });

    await expect(apiGet('/private-route')).rejects.toThrowError(APIError);

    expect(document.cookie).not.toContain('expired-token-789');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    expect(window.location.href).toBe('/login');
  });
});
