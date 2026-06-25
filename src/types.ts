export interface CutConfig {
  postW: number;
  postH: number;
  visible: number;
  bleed: number;
}

export interface GridSpec {
  cols: number;
  rows: number;
}

export interface DesignSize {
  width: number;
  height: number;
}

export type CutMode = 'mosaic' | 'carousel';
export type ExportFormat = 'png' | 'jpeg';

export interface TileSpec {
  row: number;
  col: number;
  sx: number;
  sy: number;
  readingIndex: number;
  uploadOrder: number;
}

export interface TileResult extends TileSpec {
  blob: Blob;
  url: string;
  filename: string;
}
