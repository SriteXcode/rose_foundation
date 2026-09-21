import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DEFAULT_TITLE = 'Blackrose Foundation | Empowering Communities & Driving Social Welfare';
const DEFAULT_DESC = 'Blackrose Foundation is a dedicated non-profit organization (NGO) committed to education, healthcare, women empowerment, and sustainable community development across India.';
const BASE_URL = 'https://www.blackrosefoundation.org.in';
const DEFAULT_OG_IMAGE = `${BASE_URL}/blackrose_logo.png`;

export const SEO = ({
  title,
  description,
  canonical,
  ogImage,
  ogType = 'website',
  jsonLd
}) => {
  const location = useLocation();
  const currentUrl = canonical || `${BASE_URL}${location.pathname}`;
  const pageTitle = title ? `${title} | Blackrose Foundation` : DEFAULT_TITLE;
  const pageDesc = description || DEFAULT_DESC;
  const image = ogImage || DEFAULT_OG_IMAGE;

  useEffect(() => {
    // 1. Update Title
    document.title = pageTitle;

    // Helper function to create or update meta tags
    const setMetaTag = (selector, attrName, attrVal, content) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Primary Meta Tags
    setMetaTag('meta[name="description"]', 'name', 'description', pageDesc);
    setMetaTag('meta[name="title"]', 'name', 'title', pageTitle);
    
    // 3. OpenGraph Tags
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', pageTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', pageDesc);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', currentUrl);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', image);

    // 4. Twitter Tags
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', pageTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', pageDesc);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', image);
    setMetaTag('meta[name="twitter:url"]', 'name', 'twitter:url', currentUrl);

    // 5. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentUrl);

    // 6. Dynamic JSON-LD Structured Data
    let scriptTag;
    if (jsonLd) {
      // Remove any existing dynamic script tag first
      const existing = document.getElementById('dynamic-json-ld');
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }

      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      scriptTag.id = 'dynamic-json-ld';
      scriptTag.text = JSON.stringify(jsonLd);
      document.head.appendChild(scriptTag);
    }

    return () => {
      if (scriptTag && scriptTag.parentNode) {
        scriptTag.parentNode.removeChild(scriptTag);
      }
    };
  }, [pageTitle, pageDesc, currentUrl, image, ogType, jsonLd]);

  return null;
};

export default SEO;
