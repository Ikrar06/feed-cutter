import JSZip from 'jszip';

export async function bundleZip(
  files: { name: string; blob: Blob }[],
  manifest?: string,
): Promise<Blob> {
  const zip = new JSZip();
  for (const f of files) zip.file(f.name, f.blob);
  if (manifest) zip.file('manifest.txt', manifest);
  return zip.generateAsync({ type: 'blob' });
}
