import { useEffect, useState } from 'react';

export function useImage(url: string | null) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!url) {
      setImage(null);
      return;
    }

    const img = new window.Image();
    img.src = url;
    img.crossOrigin = 'anonymous'; // critical for canvas exports!
    
    img.onload = () => {
      setImage(img);
    };
    
    img.onerror = () => {
      setImage(null);
      console.error(`Failed to load image asset at: ${url}`);
    };
  }, [url]);

  return image;
}
