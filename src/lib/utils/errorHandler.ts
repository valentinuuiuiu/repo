// Comprehensive Error Handling Utility

export class AppError extends Error {
  public readonly isOperational: boolean;
  public readonly statusCode: number;

  constructor(
    message: string, 
    statusCode: number = 500, 
    isOperational: boolean = true
  ) {
    super(message);
    
    Object.setPrototypeOf(this, new.target.prototype);
    
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

export function handleError(error: unknown): void {
  if (error instanceof AppError) {
    // Log operational errors
    console.error(`[${error.name}] ${error.message}`);
  } else if (error instanceof Error) {
    // Log unexpected errors
    console.error('Unexpected Error:', error);
  } else {
    // Log unknown errors
    console.error('Unknown Error:', error);
  }
}

export function assertDefined<T>(
  value: T | null | undefined, 
  message: string = 'Value is undefined or null'
): asserts value is T {
  if (value === null || value === undefined) {
    throw new ValidationError(message);
  }
}

export function safelyParseJSON<T = unknown>(
  json: string, 
  fallback: T | null = null
): T | null {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}