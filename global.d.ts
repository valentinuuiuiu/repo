// Global Type Declarations

declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}

// Extend global interfaces
interface Window {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
}

// Utility type for strict null checks
type Nullable<T> = T | null;
type Optional<T> = T | undefined;

// Utility function type
type AsyncFunction<T = void> = () => Promise<T>;

// Extend Error interface
interface Error {
  statusCode?: number;
}

// Extend console for better logging
interface Console {
  success(message?: any, ...optionalParams: any[]): void;
  warn(message?: any, ...optionalParams: any[]): void;
  error(message?: any, ...optionalParams: any[]): void;
}

// Extend console methods
console.success = function(message?: any, ...optionalParams: any[]) {
  console.log(`✅ ${message}`, ...optionalParams);
};

console.warn = function(message?: any, ...optionalParams: any[]) {
  console.warn(`⚠️ ${message}`, ...optionalParams);
};

console.error = function(message?: any, ...optionalParams: any[]) {
  console.error(`❌ ${message}`, ...optionalParams);
};