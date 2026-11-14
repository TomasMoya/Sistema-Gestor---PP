import "vitest";

interface AxeMatchers {
  toHaveNoViolations(): void;
}

// Declaration merging para tipar el matcher de jest-axe en Vitest: las interfaces necesitan
// quedar vacías más allá de lo heredado, así que este patrón dispara un falso positivo de la regla.
/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars */
declare module "vitest" {
  interface Assertion<T = unknown> extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
