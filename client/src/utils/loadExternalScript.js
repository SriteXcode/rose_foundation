/**
 * Dynamically loads an external script.
 * @param {string} src The URL of the script to load.
 * @returns {Promise<boolean>} A promise that resolves to true when the script is loaded, or false if it fails.
 */
export const loadExternalScript = (src) => {
  return new Promise((resolve) => {
    // Check if script is already loaded
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    
    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      console.error(`Failed to load script: ${src}`);
      resolve(false);
    };

    document.body.appendChild(script);
  });
};
