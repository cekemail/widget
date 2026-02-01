import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiClient, ApiError } from '../src/api';

describe('ApiClient', () => {
  const mockApiUrl = 'https://api.example.com/validate';
  const mockApiKey = 'test-api-key';
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient(mockApiUrl, mockApiKey);
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should send correct request headers', async () => {
    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            is_valid: true,
            is_reachable: true,
            is_disposable_email: false,
          },
        }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    await client.validateEmail('test@example.com');

    expect(fetch).toHaveBeenCalledWith(mockApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Widget-Key': mockApiKey,
        Accept: 'application/json',
      },
      body: JSON.stringify({ email: 'test@example.com' }),
    });
  });

  it('should return validation result on success', async () => {
    const mockResult = {
      is_valid: true,
      is_reachable: true,
      is_disposable_email: false,
      reason: 'Email is valid',
    };
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ data: mockResult }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    const result = await client.validateEmail('test@example.com');

    expect(result).toEqual(mockResult);
  });

  it('should throw ApiError on 401', async () => {
    const mockResponse = {
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Invalid API key' }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    await expect(client.validateEmail('test@example.com')).rejects.toThrow(ApiError);
    await expect(client.validateEmail('test@example.com')).rejects.toThrow(
      'Authorization error'
    );
  });

  it('should throw ApiError on 429 rate limit', async () => {
    const mockResponse = {
      ok: false,
      status: 429,
      json: () => Promise.resolve({ message: 'Too many requests' }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    await expect(client.validateEmail('test@example.com')).rejects.toThrow(ApiError);
    await expect(client.validateEmail('test@example.com')).rejects.toThrow(
      'Rate limit exceeded'
    );
  });

  it('should throw ApiError on other errors', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'Server error' }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    await expect(client.validateEmail('test@example.com')).rejects.toThrow(ApiError);
  });
});

describe('ApiError', () => {
  it('should store status code and server message', () => {
    const error = new ApiError('Test error', 401, 'Server message');

    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(401);
    expect(error.serverMessage).toBe('Server message');
    expect(error.name).toBe('ApiError');
  });
});
