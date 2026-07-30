/**
 * Optimizes Cloudinary image URLs by adding auto format and quality transformations.
 * Also supports resizing and cropping.
 * 
 * @param {string} url - The original image URL
 * @param {object} options - Optimization options
 * @param {number} options.width - Desired width
 * @param {number} options.height - Desired height
 * @param {string} options.crop - Crop mode (default: 'fill')
 * @returns {string} The optimized URL
 */
import { API_BASE_URL } from './constants';

export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url) return '';

  let finalUrl = url;

  // Handle local uploaded relative paths (e.g. /uploads/image-123.jpg)
  if (typeof finalUrl === 'string' && finalUrl.startsWith('/uploads/')) {
    const backendOrigin = (API_BASE_URL || 'http://localhost:5000/api').replace('/api', '');
    finalUrl = `${backendOrigin}${finalUrl}`;
  }

  // Handle Cloudinary URLs
  if (typeof finalUrl === 'string' && finalUrl.includes('cloudinary.com') && finalUrl.includes('/upload/')) {
    const transformations = ['f_auto', 'q_auto'];
    
    if (options.width) {
      transformations.push(`w_${options.width}`);
    }
    
    if (options.height) {
      transformations.push(`h_${options.height}`);
    }
    
    if (options.width || options.height) {
      transformations.push(`c_${options.crop || 'fill'}`);
    }

    const transformationString = transformations.join(',');
    
    // Check if it already has transformations (after /upload/)
    // This is a simple check that assumes standard cloudinary URL structure
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      // If the second part starts with a transformation string (contains v12345/ or similar)
      // we need to be careful not to double up. For simplicity, we just insert our defaults
      // if not already present.
      
      const afterUpload = parts[1];
      
      // If there are existing transformations (not just the version number)
      if (afterUpload.includes('/') && !afterUpload.startsWith('v')) {
         // It already has transformations, let's just make sure f_auto,q_auto are there
         let existingTransform = afterUpload.split('/')[0];
         if (!existingTransform.includes('f_auto')) existingTransform += ',f_auto';
         if (!existingTransform.includes('q_auto')) existingTransform += ',q_auto';
         
         return `${parts[0]}/upload/${existingTransform}/${afterUpload.split('/').slice(1).join('/')}`;
      } else {
         // No existing transformations (just version or public_id)
         return `${parts[0]}/upload/${transformationString}/${afterUpload}`;
      }
    }
  }
  
  return finalUrl;
};
