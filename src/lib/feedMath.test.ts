import { describe, it, expect } from 'vitest';
import { designSize, planTiles } from './feedMath';

describe('designSize — mosaic', () => {
  it('1×3 = 3104×1350', () => {
    expect(designSize({ cols: 3, rows: 1 })).toEqual({ width: 3104, height: 1350 });
  });
  it('2×3 = 3104×2700', () => {
    expect(designSize({ cols: 3, rows: 2 })).toEqual({ width: 3104, height: 2700 });
  });
  it('1×1 = 1080×1350', () => {
    expect(designSize({ cols: 1, rows: 1 })).toEqual({ width: 1080, height: 1350 });
  });
});

describe('designSize — carousel (tanpa overlap)', () => {
  it('1×3 carousel = 3240×1350', () => {
    expect(designSize({ cols: 3, rows: 1 }, undefined, 'carousel')).toEqual({ width: 3240, height: 1350 });
  });
  it('1×1 carousel = 1080×1350', () => {
    expect(designSize({ cols: 1, rows: 1 }, undefined, 'carousel')).toEqual({ width: 1080, height: 1350 });
  });
});

describe('planTiles — mosaic', () => {
  it('geser horizontal per 1012', () => {
    const t = planTiles({ cols: 3, rows: 1 });
    expect(t.map((x) => x.sx)).toEqual([0, 1012, 2024]);
  });
  it('kolom terakhir berhenti tepat di tepi desain', () => {
    const t = planTiles({ cols: 3, rows: 1 });
    const last = t[t.length - 1];
    expect(last.sx + 1080).toBe(designSize({ cols: 3, rows: 1 }).width);
  });
  it('mosaic mengupload terbalik', () => {
    const t = planTiles({ cols: 3, rows: 1 }, 'mosaic');
    expect(t.map((x) => x.uploadOrder)).toEqual([3, 2, 1]);
  });
});

describe('planTiles — carousel', () => {
  it('geser horizontal per 1080 (tanpa overlap)', () => {
    const t = planTiles({ cols: 3, rows: 1 }, 'carousel');
    expect(t.map((x) => x.sx)).toEqual([0, 1080, 2160]);
  });
  it('kolom terakhir tepat di tepi desain carousel', () => {
    const t = planTiles({ cols: 3, rows: 1 }, 'carousel');
    const last = t[t.length - 1];
    expect(last.sx + 1080).toBe(designSize({ cols: 3, rows: 1 }, undefined, 'carousel').width);
  });
  it('carousel mengupload urut normal', () => {
    const t = planTiles({ cols: 3, rows: 1 }, 'carousel');
    expect(t.map((x) => x.uploadOrder)).toEqual([1, 2, 3]);
  });
});
