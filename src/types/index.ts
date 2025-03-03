// Centralized Type Exports
export * from './schema';
export * from '../lib/ai/types';
export * from '../lib/analytics/platform-analytics';

// Additional global type definitions
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RecordOf<T> = {
  [K in keyof T]: T[K];
};

// Common Utility Functions for Type Safety
export function isNullOrUndefined<T>(value: T | null | undefined): value is null | undefined {
  return value === null || value === undefined;
}

export function assertIsDefined<T>(value: T | null | undefined): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error('Value is null or undefined');
  }
}

// Type Guards
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}