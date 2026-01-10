const Gallery = require('../models/Gallery');

// Add gallery item
exports.addGalleryItem = async (req, res) => {
  try {
    const { title, description, imageUrl, category, project } = req.body;
    if (!title || !imageUrl || !category) {
      return res.status(400).json({ error: 'Title, image URL, and category are required' });
    }

    const galleryItem = new Gallery({ 
      title, 
      description, 
      imageUrl, 
      category,
      project: project || undefined 
    });
    
    await galleryItem.save();

    res.status(201).json({ message: 'Gallery item added!', item: galleryItem });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add gallery item' });
  }
};

// Get gallery items
exports.getGalleryItems = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    
    const items = await Gallery.find(filter)
      .sort({ createdAt: -1 })
      .populate('project', 'title'); // Populate project title
      
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gallery items' });
  }
};

// Delete gallery item
exports.deleteGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await Gallery.findByIdAndDelete(id);
    
    if (!deletedItem) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }
    
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete gallery item' });
  }
};
