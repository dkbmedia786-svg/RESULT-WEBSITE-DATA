export function compressImageBase64(base64Str: string, maxWidth = 800, maxHeight = 800): Promise<string> {
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
        
        // JPEG format compressing at 0.8 quality produces lightweight binaries
        const compressed = canvas.toDataURL('image/jpeg', 0.8);
        const base64Data = compressed.split(',')[1];
        
        // ============================================================================
        // YAHAN APNA GOOGLE APPS SCRIPT WEB APP URL (Deployment URL) PASTE KAREIN
        // ============================================================================
        const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzKE_thgZD_ThFWpBypzOR4xWqBj0fdZxqSHepWbPLaBdQnAwmcSXjJwP6AaC_5bG-I/exec"; 
        
        if (APPS_SCRIPT_URL === "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE") {
          console.warn("Please paste your Google Apps Script URL in src/utils/imageResize.ts. Returning raw base64 for now.");
          resolve(compressed);
          return;
        }

        const fileExt = compressed.split(';')[0].split('/')[1] || 'jpg';
        const fileName = `upload_${new Date().getTime()}.${fileExt}`;
        const mimeType = `image/${fileExt}`;

        // Send to Apps Script directly
        fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          // Send as text/plain to avoid CORS preflight issues
          body: JSON.stringify({
            name: fileName,
            mimeType: mimeType,
            data: base64Data
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data && data.url) {
            // Transform Google Drive URL to thumbnail view to avoid iframe blocking
            let finalUrl = data.url;
            if (finalUrl.includes('drive.google.com/uc') && finalUrl.includes('id=')) {
              const idMatch = finalUrl.match(/id=([^&]+)/);
              if (idMatch && idMatch[1]) {
                finalUrl = `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`;
              }
            }
            
            // Live caching bust marker (adds ?t=TIMESTAMP or &t=TIMESTAMP)
            const separator = finalUrl.includes('?') ? '&' : '?';
            const driveUrlWithLiveUpdate = `${finalUrl}${separator}t=${new Date().getTime()}`;
            resolve(driveUrlWithLiveUpdate);
          } else {
            console.warn("Google Drive upload failed or no URL returned.", data);
            resolve(compressed);
          }
        })
        .catch(err => {
          console.error("Google Drive API upload error:", err);
          resolve(compressed);
        });

      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
}
