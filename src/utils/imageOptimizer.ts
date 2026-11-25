import {
  IMAGE_OPTIMIZE_MAX_WIDTH,
  IMAGE_OPTIMIZE_QUALITY,
  SITE_ASSET_MAX_BYTES,
  computeResizedDimensions,
  isSvgAsset,
  selectOptimalOutputMime,
  validateOptimizedAssetSize,
} from './storeLogic';

export interface OptimizeImageOptions {
  preservePngTransparency?: boolean;
  maxWidth?: number;
  quality?: number;
  maxBytes?: number;
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not decode the selected image file.'));
    };
    img.src = objectUrl;
  });
}

function canvasHasTransparency(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  try {
    const data = ctx.getImageData(0, 0, width, height).data;
    // Sample every 4th pixel for fast detection on large canvases
    const step = width * height > 500_000 ? 16 : 4;
    for (let i = 3; i < data.length; i += step) {
      if (data[i] < 255) {
        return true;
      }
    }
    return false;
  } catch {
    return true;
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

function replaceFileExtension(fileName: string, mimeType: string): string {
  const base = fileName.replace(/\.[^.]+$/, '') || 'image';
  if (mimeType === 'image/png') return `${base}.png`;
  if (mimeType === 'image/webp') return `${base}.webp`;
  return `${base}.jpg`;
}

export async function optimizeImageForUpload(
  file: File,
  options: OptimizeImageOptions = {}
): Promise<File> {
  const maxBytes = options.maxBytes ?? SITE_ASSET_MAX_BYTES;

  // Never rasterize or compress SVG files
  if (isSvgAsset({ name: file.name, type: file.type })) {
    const svgErr = validateOptimizedAssetSize(file.size, maxBytes);
    if (svgErr) throw new Error(svgErr);
    return file;
  }

  const maxWidth = options.maxWidth ?? IMAGE_OPTIMIZE_MAX_WIDTH;
  const quality = options.quality ?? IMAGE_OPTIMIZE_QUALITY;

  const img = await loadImageElement(file);
  const srcWidth = img.naturalWidth || img.width;
  const srcHeight = img.naturalHeight || img.height;
  const target = computeResizedDimensions(srcWidth, srcHeight, maxWidth);

  const canvas = document.createElement('canvas');
  canvas.width = target.width;
  canvas.height = target.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    const fallbackErr = validateOptimizedAssetSize(file.size, maxBytes);
    if (fallbackErr) throw new Error(fallbackErr);
    return file;
  }

  ctx.clearRect(0, 0, target.width, target.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, target.width, target.height);

  const isInputPng =
    file.type.toLowerCase() === 'image/png' || file.name.toLowerCase().endsWith('.png');
  const keepPngTransparency =
    Boolean(options.preservePngTransparency && isInputPng) ||
    (isInputPng && canvasHasTransparency(ctx, target.width, target.height));

  let outputMime = selectOptimalOutputMime(file.type || (isInputPng ? 'image/png' : 'image/jpeg'), {
    keepPngTransparency,
  });

  // For non-PNG photos that aren't already tiny, compress at quality 0.85;
  // for transparent PNGs, keep PNG unless it still exceeds storage limit, in which case WebP preserves alpha.
  let blob = await canvasToBlob(canvas, outputMime, quality);

  if (blob && blob.size > maxBytes && outputMime === 'image/png') {
    const webpAlphaBlob = await canvasToBlob(canvas, 'image/webp', quality);
    if (webpAlphaBlob && webpAlphaBlob.size < blob.size) {
      blob = webpAlphaBlob;
      outputMime = 'image/webp';
    }
  }

  if (!blob) {
    const fallbackErr = validateOptimizedAssetSize(file.size, maxBytes);
    if (fallbackErr) throw new Error(fallbackErr);
    return file;
  }

  // If no resize was needed and the original file is already smaller than re-encoding, keep original
  const normalizedInputMime =
    file.type.toLowerCase() === 'image/jpg' ? 'image/jpeg' : file.type.toLowerCase();
  if (!target.resized && outputMime === normalizedInputMime && blob.size >= file.size) {
    const origErr = validateOptimizedAssetSize(file.size, maxBytes);
    if (origErr) throw new Error(origErr);
    return file;
  }

  const finalFile = new File([blob], replaceFileExtension(file.name, outputMime), {
    type: outputMime,
    lastModified: Date.now(),
  });

  const sizeErr = validateOptimizedAssetSize(finalFile.size, maxBytes);
  if (sizeErr) {
    throw new Error(sizeErr);
  }

  return finalFile;
}
