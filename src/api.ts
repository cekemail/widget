import type { ValidationResult, ApiResponse } from './types';

/**
 * API client for email validation
 */
export class ApiClient {
  constructor(
    private apiUrl: string,
    private apiKey: string
  ) {}

  /**
   * Validate an email address via the API
   */
  async validateEmail(email: string): Promise<ValidationResult> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Widget-Key': this.apiKey,
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
