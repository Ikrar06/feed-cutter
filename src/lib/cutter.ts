import type { CutConfig, TileSpec, ExportFormat } from '../types';
import { DEFAULT_CONFIG } from './config';

export async function cutTile(
  source: CanvasImageSource,
  tile: TileSpec,
  cfg: CutConfig = DEFAULT_CONFIG,
  format: ExportFormat = 'png',
  quality = 1,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width  = cfg.postW;
  canvas.height = cfg.postH;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D tidak tersedia di browser ini.');

  ctx.drawImage(
    source,
    tile.sx, tile.sy, cfg.postW, cfg.postH,
    0, 0, cfg.postW, cfg.postH,
  );

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Gagal meng-encode gambar.'))),
      format === 'png' ? 'image/png' : 'image/jpeg',
      quality,
    );
  });
}
