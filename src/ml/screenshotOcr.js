import Tesseract from 'tesseract.js';

/**
 * Supported image MIME types
 */
export const SUPPORTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp'
];

/**
 * Validates if the uploaded file is a supported image format.
 */
export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }
  
  const type = (file.type || '').toLowerCase();
  const name = (file.name || '').toLowerCase();
  const isSupportedMime = SUPPORTED_IMAGE_TYPES.includes(type);
  const isSupportedExt = /\.(png|jpe?g|webp)$/i.test(name);
  
  if (!isSupportedMime && !isSupportedExt) {
    return {
      valid: false,
      error: 'Unsupported file type. Please upload a PNG, JPG, JPEG, or WEBP image.'
    };
  }
  
  return { valid: true, error: null };
}

/**
 * Helper to load an image source (File, Blob, or URL) into an HTMLImageElement
 */
function loadImageElement(source) {
  return new Promise((resolve, reject) => {
    if (typeof Image === 'undefined') {
      return reject(new Error('Image constructor not available in this environment'));
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    let objectUrl = null;

    img.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = (err) => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for preprocessing: ' + (err?.message || 'load error')));
    };

    if (typeof source === 'string') {
      img.src = source;
    } else if (typeof Blob !== 'undefined' && (source instanceof Blob || source instanceof File)) {
      objectUrl = URL.createObjectURL(source);
      img.src = objectUrl;
    } else {
      reject(new Error('Unsupported image source type'));
    }
  });
}

/**
 * Preprocesses an image client-side using an HTML5 Canvas:
 * 1. Upscales image by ~2.2x to increase character pixel density (DPI).
 * 2. Converts to Grayscale using standard luminosity weighting (0.299R + 0.587G + 0.114B).
 * 3. Applies Dynamic Contrast Stretching to separate dark text from background.
 * 4. Applies a 3x3 Laplacian sharpening convolution to enhance character edges and separate kerning.
 * 
 * Runs 100% locally in the browser with zero external server dependencies.
 *
 * @param {File|Blob|string} imageSource
 * @returns {Promise<HTMLCanvasElement|File|Blob|string>} Preprocessed canvas or fallback
 */
export async function preprocessImageForOcr(imageSource) {
  // If not in a browser environment (e.g. Node CLI testing), fall back gracefully
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return imageSource;
  }

  // If already a canvas, return as is
  if (typeof HTMLCanvasElement !== 'undefined' && imageSource instanceof HTMLCanvasElement) {
    return imageSource;
  }

  try {
    const img = await loadImageElement(imageSource);
    const origW = img.naturalWidth || img.width;
    const origH = img.naturalHeight || img.height;

    if (!origW || !origH) {
      return imageSource;
    }

    // Step 1: Upscaling
    // Text OCR recognition quality jumps significantly when character height is > 30px.
    let scale = 2.2;
    if (origW * scale > 3000) {
      scale = 3000 / origW;
    }
    const targetW = Math.max(1, Math.round(origW * scale));
    const targetH = Math.max(1, Math.round(origH * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
      return imageSource;
    }

    // High quality bicubic interpolation
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, targetW, targetH);

    // Step 2: Pixel Data Extraction
    const imgData = ctx.getImageData(0, 0, targetW, targetH);
    const data = imgData.data;
    const len = data.length;

    // Calculate luminosity statistics for adaptive contrast stretching
    let minLum = 255;
    let maxLum = 0;
    const lumArray = new Float32Array(len / 4);

    for (let i = 0, j = 0; i < len; i += 4, j++) {
      // Standard ITU-R BT.601 luma formula
      const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      lumArray[j] = luma;
      if (luma < minLum) minLum = luma;
      if (luma > maxLum) maxLum = luma;
    }

    const lumRange = maxLum - minLum || 1;

    // Step 3: Grayscale Conversion + Dynamic Contrast Enhancement
    for (let i = 0, j = 0; i < len; i += 4, j++) {
      // Normalize to 0..1
      const normalized = (lumArray[j] - minLum) / lumRange;
      
      // S-curve contrast enhancement: push light background towards white, dark text towards deep black
      let enhanced;
      if (normalized > 0.65) {
        enhanced = Math.min(255, 215 + (normalized - 0.65) * 114);
      } else if (normalized < 0.35) {
        enhanced = Math.max(0, normalized * 170);
      } else {
        enhanced = normalized * 255;
      }

      data[i] = enhanced;     // Red
      data[i + 1] = enhanced; // Green
      data[i + 2] = enhanced; // Blue
      // data[i + 3] remains alpha
    }

    // Step 4: Sharpening (3x3 Laplacian edge enhancement)
    // Sharpen character stems (like 'f' in 'Transfer') and text boundary delineation
    const sharpenedData = ctx.createImageData(targetW, targetH);
    const sData = sharpenedData.data;

    // Pre-fill with processed data
    sData.set(data);

    const w = targetW;
    const h = targetH;

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = (y * w + x) * 4;
        const top = ((y - 1) * w + x) * 4;
        const bottom = ((y + 1) * w + x) * 4;
        const left = (y * w + (x - 1)) * 4;
        const right = (y * w + (x + 1)) * 4;

        // Kernel: center = 3.0, neighbors = -0.5
        const centerVal = data[idx];
        const neighborSum = data[top] + data[bottom] + data[left] + data[right];
        const val = 3.0 * centerVal - 0.5 * neighborSum;
        const clamped = Math.min(255, Math.max(0, val));

        sData[idx] = clamped;
        sData[idx + 1] = clamped;
        sData[idx + 2] = clamped;
      }
    }

    ctx.putImageData(sharpenedData, 0, 0);

    return canvas;
  } catch (err) {
    console.warn('Canvas OCR preprocessing encountered an issue; falling back to original image:', err);
    return imageSource;
  }
}

/**
 * Extracts visible text from an image using browser-side Tesseract.js OCR.
 * Processing runs 100% locally in the client browser with pre-OCR image enhancement.
 *
 * @param {File|Blob|string} imageSource - The image file, blob, or data URL
 * @param {Function} [onProgress] - Optional callback receiving progress percentage (0-100)
 * @returns {Promise<{ success: boolean, text: string, confidence: number, error?: string }>}
 */
export async function extractTextFromScreenshot(imageSource, onProgress = () => {}) {
  try {
    if (typeof File !== 'undefined' && imageSource instanceof File) {
      const validation = validateImageFile(imageSource);
      if (!validation.valid) {
        return { success: false, text: '', confidence: 0, error: validation.error };
      }
    }

    onProgress(5);

    // 1. Client-side canvas preprocessing (upscaling, grayscale, contrast stretching, edge sharpening)
    const processedInput = await preprocessImageForOcr(imageSource);

    onProgress(15);

    // 2. Real browser-side Tesseract.js OCR recognition
    const result = await Tesseract.recognize(processedInput, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text' && typeof m.progress === 'number') {
          const pct = Math.min(99, Math.round(15 + m.progress * 84));
          onProgress(pct);
        }
      }
    });

    onProgress(100);

    const extractedText = (result?.data?.text || '').trim();
    const confidence = result?.data?.confidence || 0;

    if (!extractedText) {
      return {
        success: false,
        text: '',
        confidence: 0,
        error: 'No readable text could be detected in this screenshot. Please ensure the message is clear, high-contrast, and unobstructed, or enter the text manually.'
      };
    }

    return {
      success: true,
      text: extractedText,
      confidence,
      error: null
    };
  } catch (err) {
    console.error('Local OCR extraction error:', err);
    return {
      success: false,
      text: '',
      confidence: 0,
      error: `OCR processing failed: ${err.message || 'Unable to parse image in browser'}. Please verify image readability or paste message manually.`
    };
  }
}
