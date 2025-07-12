// Utility function to get the correct image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // If the image path is already a full URL (Cloudinary), return it as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Fallback for local images (if any)
  if (process.env.NODE_ENV === 'development') {
    return `/uploads/${imagePath}`;
  }
  
  const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
  return `${serverUrl}/uploads/${imagePath}`;
};

// Alternative: Always use the full server URL or return Cloudinary URL as is
export const getImageUrlFull = (imagePath) => {
  if (!imagePath) return '';
  
  // Debug logging
  console.log('getImageUrlFull called with:', imagePath);
  
  // If the image path is already a full URL (Cloudinary), return it as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('Returning Cloudinary URL:', imagePath);
    return imagePath;
  }
  
  // For development, use the proxy (same as getImageUrl)
  if (process.env.NODE_ENV === 'development') {
    const url = `/uploads/${imagePath}`;
    console.log('Returning development URL:', url);
    return url;
  }
  
  // For production, construct full URL
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = '';
  const url = `${protocol}//${hostname}${port}/uploads/${imagePath}`;
  console.log('Returning production URL:', url);
  return url;
}; 