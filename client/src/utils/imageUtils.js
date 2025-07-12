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
  
  // If the image path is already a full URL (Cloudinary), return it as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Fallback for local images (if any)
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = process.env.NODE_ENV === 'development' ? ':5000' : '';
  
  return `${protocol}//${hostname}${port}/uploads/${imagePath}`;
}; 