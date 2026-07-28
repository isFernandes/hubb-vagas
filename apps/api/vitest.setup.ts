import { vi } from 'vitest';

// Make jest globals map directly to vitest vi
globalThis.jest = vi as any;
