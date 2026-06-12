/**
 * Compress and downsize an uploaded image to a lightweight format safely fit under Google Sheets cellular size limits.
 * Downscaling to max 180x180 JPEG at 0.70 quality compresses the size down to just 2KB - 4KB (approx 4000 chars of Base64).
 */
export function compressImageBase64(base64Str: string, maxWidth = 180, maxHeight = 180): Promise<string> {
  return new Promise((resolve) => {
    // If it's a remote URL and not base64, return as is
    if (!base64Str || !base64Str.startsWith('data:image/')) {
      resolve(base64Str);
      return;
    }

    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate perfect aspect ratio sizing
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF'; // Ensure high contrast white backdrops
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        // JPEG format compressing at 0.7 quality produces ultra lightweight binaries
        const compressed = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressed);
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
}
