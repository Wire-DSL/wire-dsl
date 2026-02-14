// Main export for @wire-dsl/engine
// Pure JavaScript/TypeScript - browser-safe, no Node.js dependencies
// Re-export all modules

export * from './parser/index';
export * from './ir/index';
export * from './layout/index';
export * from './renderer/index';
export * from './renderer/skeleton';
export * from './renderer/tokens';

// SourceMap module (experimental)
export * from './sourcemap/index';

// Version
export const version = '0.0.1';
