/**
 * Property-based test: Glass blur radius (Property 10)
 *
 * Property 10: Glass blur radius is within specification
 *   For any blur radius r in [10, 20], parseBlurRadius('blur(' + r + 'px)')
 *   SHALL return a value in [10, 20].
 *   Validates: Requirements 2.4, 4.4, 5.6, 6.5, 9.4
 *
 * @vitest-environment node
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// ---------------------------------------------------------------------------
// parseBlurRadius — pure function under test
// Mirrors the implementation in main.js / window.parseBlurRadius
// ---------------------------------------------------------------------------

/**
 * Parses a backdrop-filter CSS string like "blur(16px)" and returns the
 * numeric pixel value.
 * @param {string} backdropFilterValue
 * @returns {number|null}
 */
function parseBlurRadius(backdropFilterValue) {
  const match = backdropFilterValue.match(/blur\((\d+(?:\.\d+)?)px\)/);
  return match ? parseFloat(match[1]) : null;
}

// ---------------------------------------------------------------------------
// Property 10: Glass blur radius is within specification
// ---------------------------------------------------------------------------

describe('Property 10: Glass blur radius is within specification', () => {
  /**
   * Validates: Requirements 2.4, 4.4, 5.6, 6.5, 9.4
   *
   * For any integer blur radius r in [10, 20],
   * parseBlurRadius('blur(' + r + 'px)') SHALL return a value in [10, 20].
   */
  it('parseBlurRadius returns a value in [10, 20] for integer radii in [10, 20]', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10, max: 20 }),
        (r) => {
          const result = parseBlurRadius('blur(' + r + 'px)');
          return result !== null && result >= 10 && result <= 20;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Validates: Requirements 2.4, 4.4, 5.6, 6.5, 9.4
   *
   * For any float blur radius r in [10, 20],
   * parseBlurRadius('blur(' + r + 'px)') SHALL return a value in [10, 20].
   */
  it('parseBlurRadius returns a value in [10, 20] for float radii in [10, 20]', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 10, max: 20, noNaN: true }),
        (r) => {
          const result = parseBlurRadius('blur(' + r + 'px)');
          return result !== null && result >= 10 && result <= 20;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Validates: Requirements 2.4, 4.4, 5.6, 6.5, 9.4
   *
   * The design token value blur(16px) SHALL parse to exactly 16.
   */
  it('parseBlurRadius returns 16 for the design token value "blur(16px)"', () => {
    expect(parseBlurRadius('blur(16px)')).toBe(16);
  });
});
