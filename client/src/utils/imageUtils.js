export const getOptimizedImageUrl = (url) => {
  if (!url) return null;
  
  // Handle Cloudinary URLs
  if (url.includes('cloudinary.com')) {
    // Check if it already has transformations
    if (url.includes('/upload/')) {
       // Insert f_auto,q_auto after /upload/
       // Avoid double insertion if already present
       if (!url.includes('f_auto') && !url.includes('q_auto')) {
         return url.replace('/upload/', '/upload/f_auto,q_auto/');
       }
    }
  }
  
  // Handle local uploads (if they don't start with http)
  // Assuming relative path like 'uploads/file.jpg' or '/uploads/file.jpg'
  // But we need the API_BASE_URL. 
  // Since this is a pure function, we might pass the base URL or just return as is if we can't determine.
  // However, the existing code checks startsWith('http').
  
  return url;
};
