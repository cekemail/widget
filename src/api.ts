import type { ValidationResult, ApiResponse } from './types';

/**
 * Returns the API key to send with the next request
 */
export type ApiKeyGetter = () => string | null | undefined;

/**
 * API client for email validation
 */
export class ApiClient {
  private getApiKey: ApiKeyGetter;

  constructor(
    private apiUrl: string,
    apiKey: string | ApiKeyGetter
  ) {
    this.getApiKey = typeof apiKey === 'function' ? apiKey : () => apiKey;
  }

  /**
   * Validate an email address via the API
   */
  async validateEmail(email: string): Promise<ValidationResult> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Widget-Key': this.getApiKey() ?? '',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data: ApiResponse = await response.json();

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new ApiError('Authorization error', response.status, data.message);
      }
      if (response.status === 429) {
        throw new ApiError('Rate limit exceeded', response.status, data.message);
      }
      throw new ApiError(
        data.message || 'Validation failed',
        response.status,
        data.message
      );
    }

    return data.data || (data as unknown as ValidationResult);
  }
}

/**
 * Custom error for API failures
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public serverMessage?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
