// Utility function to get the correct image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // If we're in development and the server is running on localhost
  if (process.env.NODE_ENV === 'development') {
    // Use the proxy URL for development
    return `/uploads/${imagePath}`;
  }
  
  // For production, use the full server URL
  const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
  return `${serverUrl}/uploads/${imagePath}`;
};

// Alternative: Always use the full server URL
export const getImageUrlFull = (imagePath) => {
  if (!imagePath) return '';
  
  // Get the current hostname and port
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = process.env.NODE_ENV === 'development' ? ':5000' : '';
  
  return `${protocol}//${hostname}${port}/uploads/${imagePath}`;
}; 