import type { GridSpec, CutConfig, DesignSize } from '../types';
import { designSize } from './feedMath';
import { DEFAULT_CONFIG } from './config';

export interface Validation {
  ok: boolean;
  level: 'ok' | 'scalable' | 'distort';
  expected: DesignSize;
  actual: DesignSize;
  message: string;
}

export function validateSize(
  actual: DesignSize,
  grid: GridSpec,
  cfg: CutConfig = DEFAULT_CONFIG,
): Validation {
  const expected = designSize(grid, cfg);
  const exact = actual.width === expected.width && actual.height === expected.height;
  const ratioOk =
    Math.abs(actual.width / actual.height - expected.width / expected.height) < 0.001;

  if (exact) {
    return {
      ok: true,
      level: 'ok',
      expected,
      actual,
      message: `Pas — ${expected.width}×${expected.height}px.`,
    };
  }
  if (ratioOk) {
    return {
      ok: false,
      level: 'scalable',
      expected,
      actual,
      message: `Rasio benar, ukuran beda. Bisa di-scale ke ${expected.width}×${expected.height}px.`,
    };
  }
  return {
    ok: false,
    level: 'distort',
    expected,
    actual,
    message: `Ukuran harus ${expected.width}×${expected.height}px. Punyamu ${actual.width}×${actual.height}px — hasilnya bisa gepeng.`,
  };
}
