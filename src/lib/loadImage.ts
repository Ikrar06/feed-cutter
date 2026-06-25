export async function loadImage(file: File): Promise<ImageBitmap> {
  return await createImageBitmap(file);
}
