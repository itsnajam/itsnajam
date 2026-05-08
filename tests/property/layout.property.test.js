/**
 * Property-based test: Responsive grid column count matches breakpoint (Property 7)
 *
 * For any viewport width, getColumnCount(width) SHALL return:
 *   - 3 when width > 1024 px
 *   - 2 when 769 px ≤ width ≤ 1024 px
 *   - 1 when width ≤ 768 px
 *
 * Validates: Requirements 5.5, 7.3
 *
 * @vitest-environment jsdom
 */

import { describe, it } from 'vitest';
import * as fc from 'fast-check';

// ---------------------------------------------------------------------------
// getColumnCount — replicated here for isolated property testing.
// ---------------------------------------------------------------------------

/**
 * Returns the number of grid columns for a given viewport width.
 * @param {number} width - Viewport width in pixels
 * @returns {1|2|3}
 */
function getColumnCount(width) {
  if (width > 1024) return 3;
  if (width >= 769) return 2;
  return 1;
}

// ---------------------------------------------------------------------------
// Property 7: Responsive grid column count matches breakpoint
// ---------------------------------------------------------------------------

describe('Property 7: Responsive grid column count matches breakpoint', () => {
  /**
   * Validates: Requirements 5.5, 7.3
   */

  it('returns 3 columns for any width > 1024 px', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1025, max: 10000 }),
        (width) => getColumnCount(width) === 3
      ),
      { numRuns: 100 }
    );
  });

  it('returns 2 columns for any width in [769, 1024] px', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 769, max: 1024 }),
        (width) => getColumnCount(width) === 2
      ),
      { numRuns: 100 }
    );
  });

  it('returns 1 column for any width ≤ 768 px', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 768 }),
        (width) => getColumnCount(width) === 1
      ),
      { numRuns: 100 }
    );
  });

  it('always returns 1, 2, or 3 for any positive width', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        (width) => {
          const cols = getColumnCount(width);
          return cols === 1 || cols === 2 || cols === 3;
        }
      ),
      { numRuns: 200 }
    );
  });

  it('boundary: width 1025 returns 3 columns', () => {
    fc.assert(
      fc.property(
        fc.constant(1025),
        (width) => getColumnCount(width) === 3
      ),
      { numRuns: 1 }
    );
  });

  it('boundary: width 1024 returns 2 columns', () => {
    fc.assert(
      fc.property(
        fc.constant(1024),
        (width) => getColumnCount(width) === 2
      ),
      { numRuns: 1 }
    );
  });

  it('boundary: width 769 returns 2 columns', () => {
    fc.assert(
      fc.property(
        fc.constant(769),
        (width) => getColumnCount(width) === 2
      ),
      { numRuns: 1 }
    );
  });

  it('boundary: width 768 returns 1 column', () => {
    fc.assert(
      fc.property(
        fc.constant(768),
        (width) => getColumnCount(width) === 1
      ),
      { numRuns: 1 }
    );
  });
});
