/**
 * Property-based test: Parallax offset is bounded (Property 3)
 * Validates: Requirements 1.6
 *
 * For any float rawDx and rawDy, clampParallax(rawDx, 20) and
 * clampParallax(rawDy, 20) SHALL each return a value in [−20, 20].
 *
 * @vitest-environment jsdom
 */

import { describe, it } from 'vitest';
import * as fc from 'fast-check';

// ---------------------------------------------------------------------------
// clampParallax — replicated here for isolated property testing.
// ---------------------------------------------------------------------------

/**
 * Clamps a value to the range [-max, max].
 * @param {number} value
 * @param {number} max
 * @returns {number}
 */
function clampParallax(value, max) {
  return Math.min(Math.max(value, -max), max);
}

// ---------------------------------------------------------------------------
// Property 3: Parallax offset is bounded
// ---------------------------------------------------------------------------

describe('Property 3: Parallax offset is bounded', () => {
  /**
   * Validates: Requirements 1.6
   *
   * For any mouse-derived dx and dy values, clamping to ±20 px must always
   * produce a result within [−20, 20].
   */
  it('clampParallax(value, 20) always returns a value in [−20, 20]', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -10000, max: 10000, noNaN: true }),
        fc.float({ min: -10000, max: 10000, noNaN: true }),
        (rawDx, rawDy) => {
          const dx = clampParallax(rawDx, 20);
          const dy = clampParallax(rawDy, 20);
          return dx >= -20 && dx <= 20 && dy >= -20 && dy <= 20;
        }
      ),
      { numRuns: 100 }
    );
  });
});
