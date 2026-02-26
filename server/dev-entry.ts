const originalExit = process.exit;
process.exit = function(code?: number) {
  if (code === 1) {
    return undefined as never;
  }
  return originalExit.call(process, code);
} as typeof process.exit;

await import('./index.ts');
