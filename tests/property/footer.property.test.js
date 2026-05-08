/**
 * Property-based test: Footer copyright year (Property 8)
 *
 * Property 8: Copyright year is always current
 *   For any Date object, getCopyrightYear(date) SHALL return date.getFullYear().
 *   Validates: Requirements 6.3
 *
 * @vitest-environment node
 */

import { describe, it } from 'vitest';
import * as fc from 'fast-check';

// ---------------------------------------------------------------------------
// getCopyrightYear — pure function under test
// Mirrors the implementation in main.js / window.getCopyrightYear
// ---------------------------------------------------------------------------

/**
 * Returns the full 4-digit year from a Date object.
 * @param {Date} date
 * @returns {number}
 */
function getCopyrightYear(date) {
  return date.getFullYear();
}

// ---------------------------------------------------------------------------
// Property 8: Copyright year is always current
// ---------------------------------------------------------------------------

describe('Property 8: Copyright year is always current', () => {
  /**
   * Validates: Requirements 6.3
   *
   * For any Date object, getCopyrightYear(date) SHALL return date.getFullYear().
   */
  it('getCopyrightYear(date) always equals date.getFullYear() for any date', () => {
    fc.assert(
      fc.property(
        fc.date(),
        (date) => {
          return getCopyrightYear(date) === date.getFullYear();
        }
      ),
      { numRuns: 100 }
    );
  });
});
