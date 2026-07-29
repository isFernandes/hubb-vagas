import { vi, MockInstance } from 'vitest';

declare global {
  var jest: typeof vi;
  namespace jest {
    type Mocked<T> = {
      [P in keyof T]: T[P] extends (...args: any[]) => any
        ? MockInstance<T[P]>
        : T[P];
    };
  }
}
