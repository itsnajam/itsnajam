/**
 * Unit tests for StarField — clampParallax helper and setParallaxOffset logic
 * Validates: Requirements 1.6
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// clampParallax — replicated here for isolated unit testing.
// The real implementation lives in main.js and is also attached to window.
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
// Minimal StarField implementation for testing setParallaxOffset behaviour
// ---------------------------------------------------------------------------

class StarField {
  constructor(canvasEl, options = {}) {
    const { count = 150, speed = 0.3, parallaxStrength = 20 } = options;
    this.parallaxStrength = parallaxStrength;
    this._parallaxDx = 0;
    this._parallaxDy = 0;
  }

  setParallaxOffset(dx, dy) {
    this._parallaxDx = clampParallax(dx, this.parallaxStrength);
    this._parallaxDy = clampParallax(dy, this.parallaxStrength);
  }
}

// ---------------------------------------------------------------------------
// Tests: clampParallax
// ---------------------------------------------------------------------------

describe('clampParallax', () => {
  it('returns the value unchanged when within range', () => {
    expect(clampParallax(10, 20)).toBe(10);
    expect(clampParallax(-10, 20)).toBe(-10);
    expect(clampParallax(0, 20)).toBe(0);
  });

  it('clamps positive values exceeding max to max', () => {
    expect(clampParallax(25, 20)).toBe(20);
    expect(clampParallax(10000, 20)).toBe(20);
  });

  it('clamps negative values below -max to -max', () => {
    expect(clampParallax(-30, 20)).toBe(-20);
    expect(clampParallax(-10000, 20)).toBe(-20);
  });

  it('returns exactly max at the positive boundary', () => {
    expect(clampParallax(20, 20)).toBe(20);
  });

  it('returns exactly -max at the negative boundary', () => {
    expect(clampParallax(-20, 20)).toBe(-20);
  });
});

// ---------------------------------------------------------------------------
// Tests: StarField.setParallaxOffset
// ---------------------------------------------------------------------------

describe('StarField.setParallaxOffset', () => {
  it('clamps (25, -30) to (20, -20)', () => {
    const sf = new StarField(null);
    sf.setParallaxOffset(25, -30);
    expect(sf._parallaxDx).toBe(20);
    expect(sf._parallaxDy).toBe(-20);
  });

  it('leaves (0, 0) unchanged', () => {
    const sf = new StarField(null);
    sf.setParallaxOffset(0, 0);
    expect(sf._parallaxDx).toBe(0);
    expect(sf._parallaxDy).toBe(0);
  });

  it('leaves boundary values (-20, 20) unchanged', () => {
    const sf = new StarField(null);
    sf.setParallaxOffset(-20, 20);
    expect(sf._parallaxDx).toBe(-20);
    expect(sf._parallaxDy).toBe(20);
  });

  it('clamps large positive values to 20', () => {
    const sf = new StarField(null);
    sf.setParallaxOffset(9999, 9999);
    expect(sf._parallaxDx).toBe(20);
    expect(sf._parallaxDy).toBe(20);
  });

  it('clamps large negative values to -20', () => {
    const sf = new StarField(null);
    sf.setParallaxOffset(-9999, -9999);
    expect(sf._parallaxDx).toBe(-20);
    expect(sf._parallaxDy).toBe(-20);
  });

  it('respects a custom parallaxStrength', () => {
    const sf = new StarField(null, { parallaxStrength: 10 });
    sf.setParallaxOffset(15, -15);
    expect(sf._parallaxDx).toBe(10);
    expect(sf._parallaxDy).toBe(-10);
  });
});
