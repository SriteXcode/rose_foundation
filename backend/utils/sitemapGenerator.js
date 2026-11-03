const fs = require('fs');
const path = require('path');
const BlogPost = require('../models/BlogPost');

const BASE_URL = 'https://www.blackrosefoundation.org.in';

const staticPages = [
  { url: '/', changefreq: 'daily', priority: '1.0' },
  { url: '/blog', changefreq: 'daily', priority: '0.9' },
  { url: '/campaigns', changefreq: 'weekly', priority: '0.8' },
  { url: '/projects', changefreq: 'weekly', priority: '0.8' },
  { url: '/donate', changefreq: 'weekly', priority: '0.9' },
  { url: '/gallery', changefreq: 'monthly', priority: '0.7' },
  { url: '/newsletter-history', changefreq: 'monthly', priority: '0.6' },
  { url: '/legal', changefreq: 'monthly', priority: '0.5' }
];

const generateSitemapXml = async () => {
  const posts = await BlogPost.find({ status: 'published' })
    .select('slug createdAt updatedAt')
    .sort({ createdAt: -1 });

  const todayStr = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static core routes
  xml += `  <!-- Core Pages -->\n`;
  for (const page of staticPages) {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}${page.url}</loc>\n`;
    xml += `    <lastmod>${todayStr}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // Published Blog Posts
  if (posts.length > 0) {
    xml += `\n  <!-- Published Blog Posts -->\n`;
    for (const post of posts) {
      if (!post.slug) continue;
      const lastModDate = (post.updatedAt || post.createdAt || new Date()).toISOString().split('T')[0];
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}/blog/${encodeURIComponent(post.slug)}</loc>\n`;
      xml += `    <lastmod>${lastModDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }
  }

  xml += `</urlset>\n`;

  // Try updating the static client/public/sitemap.xml file if it exists
  try {
    const clientPublicPath = path.resolve(__dirname, '../../client/public/sitemap.xml');
    if (fs.existsSync(path.dirname(clientPublicPath))) {
      fs.writeFileSync(clientPublicPath, xml, 'utf8');
    }
  } catch (err) {
    // Non-blocking in production if client folder isn't co-located
  }

  return xml;
};

module.exports = {
  generateSitemapXml
};
