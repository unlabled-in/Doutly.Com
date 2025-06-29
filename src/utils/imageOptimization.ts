// Image optimization utilities
export const optimizeImageUrl = (url: string, width?: number, height?: number, quality: number = 80): string => {
  // For Pexels images, add optimization parameters
  if (url.includes('pexels.com')) {
    const urlObj = new URL(url);
    if (width) urlObj.searchParams.set('w', width.toString());
    if (height) urlObj.searchParams.set('h', height.toString());
    urlObj.searchParams.set('auto', 'compress');
    urlObj.searchParams.set('cs', 'tinysrgb');
    return urlObj.toString();
  }
  
  return url;
};

// Lazy loading image component
export const createImageLoader = () => {
  const imageCache = new Set<string>();
  
  return {
    preloadImage: (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (imageCache.has(src)) {
          resolve();
          return;
        }
        
        const img = new Image();
        img.onload = () => {
          imageCache.add(src);
          resolve();
        };
        img.onerror = reject;
        img.src = src;
      });
    },
    
    isImageCached: (src: string): boolean => {
      return imageCache.has(src);
    }
  };
};

// Image compression for uploads
export const compressImage = (file: File, maxWidth: number = 1920, maxHeight: number = 1080, quality: number = 0.8): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};