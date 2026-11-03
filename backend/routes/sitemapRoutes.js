const express = require('express');
const router = express.Router();
const { generateSitemapXml } = require('../utils/sitemapGenerator');

router.get('/sitemap.xml', async (req, res) => {
  try {
    const xml = await generateSitemapXml();
    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600'); // 1 hour cache
    return res.send(xml);
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
    return res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
