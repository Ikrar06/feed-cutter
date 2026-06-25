import type { CutConfig } from '../types';

export const DEFAULT_CONFIG: CutConfig = {
  postW: 1080,
  postH: 1350,
  visible: 1012,
  bleed: 34,
};

export const overlap = (c: CutConfig): number => c.bleed * 2;
export const stepX   = (c: CutConfig): number => c.visible;
export const stepY   = (c: CutConfig): number => c.postH;
