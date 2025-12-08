export interface ValidationError {
  validation: Array<{
    field: string;
    message: string;
  }>;
  statusCode: number;
  message: string;
}

export function isValidationError(error: unknown): error is ValidationError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'validation' in error &&
    Array.isArray((error as ValidationError).validation)
  );
}

export class UnprocessedEntityError extends Error implements ValidationError {
  public readonly validation: Array<{ field: string; message: string }>;
  public readonly statusCode: number;

  constructor(errors: string[]) {
    super('Validation error');
    this.name = 'UnprocessedEntityError';
    this.statusCode = 422;
    this.validation = (errors ?? []).map((error) => ({
      field: 'multipart',
      message: error,
    }));

    // Make validation enumerable so it appears in serialization
    Object.defineProperty(this, 'validation', {
      enumerable: true,
      writable: true,
      value: this.validation,
    });

    Object.defineProperty(this, 'statusCode', {
      enumerable: true,
      writable: false,
      value: this.statusCode,
    });
  }

  getErrors(): string[] {
    return this.validation.map((v) => v.message);
  }

  getStatusCode(): number {
    return this.statusCode;
  }

  public toResponseBody() {
    return {
      statusCode: this.statusCode,
      message: this.message,
      validation: this.validation,
    };
  }

  // Override toJSON for proper serialization
  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      validation: this.validation,
    };
  }
}
