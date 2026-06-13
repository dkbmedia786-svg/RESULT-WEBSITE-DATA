import { getCachedAccessToken } from '../googleSheetsSync';

/**
 * Helper to upload image to Google Drive as an anonymous public file.
 */
async function uploadToGoogleDrive(base64Str: string, accessToken: string): Promise<string> {
  const mimeType = base64Str.split(';')[0].split(':')[1] || 'image/jpeg';
  const metadata = {
    name: 'photo_' + Date.now() + '.jpg',
    mimeType: mimeType,
    parents: ['root']
  };

  const b64Data = base64UrlToBuffer(base64Str);
  const blob = new Blob([b64Data], { type: mimeType });

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', blob);

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: form
  });

  if (!res.ok) {
    throw new Error('Drive upload failed');
  }

  const data = await res.json();
  
  // Make it public readable
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${data.id}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role: 'reader', type: 'anyone' })
    });
  } catch (e) {
    console.warn('Failed to set public permissions', e);
  }

  // Use the standard Google Drive image proxy
  return `https://drive.google.com/uc?export=view&id=${data.id}`;
}

function base64UrlToBuffer(base64Url: string) {
  const b64Data = base64Url.split(',')[1];
  const byteCharacters = atob(b64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  return new Uint8Array(byteNumbers);
}

/**
 * Compress and downsize an uploaded image to a lightweight format safely fit under Google Sheets cellular size limits.
 * If logged in with Google (Admin), uploads directly to Google Drive to generate a high quality public remote URL.
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
    img.onload = async () => {
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
        
        const token = getCachedAccessToken();
        if (token) {
           try {
             const driveUrl = await uploadToGoogleDrive(compressed, token);
             resolve(driveUrl);
             return;
           } catch (e) {
             console.error("Falling back to base64 due to drive error", e);
           }
        }
        
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
