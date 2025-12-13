// lib/utils/errorHandler.ts
// Centralized error handling utilities

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(message, 'DATABASE_ERROR', 500);
    this.name = 'DatabaseError';
    if (originalError) {
      this.stack = originalError.stack;
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Handle errors consistently across the app
 */
export function handleError(error: unknown): AppError {
  console.error('Error occurred:', error);
  
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    // Firebase errors
    if (error.message.includes('permission-denied')) {
      return new AuthenticationError('You don\'t have permission to access this resource');
    }
    
    if (error.message.includes('not-found')) {
      return new AppError('Resource not found', 'NOT_FOUND', 404);
    }
    
    if (error.message.includes('already-exists')) {
      return new ValidationError('Resource already exists');
    }
    
    // Network errors
    if (error.message.includes('network')) {
      return new AppError('Network error. Please check your connection.', 'NETWORK_ERROR', 503);
    }
    
    // Generic error
    return new AppError(
      error.message || 'An unexpected error occurred',
      'UNKNOWN_ERROR',
      500,
      false
    );
  }
  
  return new AppError('An unexpected error occurred', 'UNKNOWN_ERROR', 500, false);
}

/**
 * Log error to external service (e.g., Sentry)
 */
export function logError(error: Error | AppError, context?: Record<string, any>) {
  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with Sentry or similar
    console.error('Production error:', { error, context });
  } else {
    console.error('Development error:', error, context);
  }
}

/**
 * Toast-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

