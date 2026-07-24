const Gallery = require('../models/Gallery');

// Add gallery item
exports.addGalleryItem = async (req, res) => {
  try {
    const { title, description, imageUrl, category, project } = req.body;
    if (!title || !imageUrl || !category) {
      return res.status(400).json({ error: 'Title, image URL, and category are required' });
    }

    const isValidProject = project && typeof project === 'string' && project.trim() !== '' && project !== 'none';

    const galleryItem = new Gallery({ 
      title, 
      description, 
      imageUrl, 
      category,
      project: isValidProject ? project : undefined 
    });
    
    await galleryItem.save();

    res.status(201).json({ message: 'Gallery item added!', item: galleryItem });
  } catch (error) {
    console.error('Failed to add gallery item:', error);
    res.status(500).json({ error: 'Failed to add gallery item' });
  }
};

// Get gallery items
exports.getGalleryItems = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const filter = category ? { category } : {};
    
    const items = await Gallery.find(filter)
      .sort({ createdAt: -1 })
      .populate('project', 'title') // Populate project title
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    const count = await Gallery.countDocuments(filter);

    res.json({
      items,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gallery items' });
  }
};

// Delete gallery item
exports.deleteGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === 'undefined') {
      return res.status(400).json({ error: 'Invalid gallery item ID' });
    }
    
    const deletedItem = await Gallery.findByIdAndDelete(id);
    
    if (!deletedItem) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }
    
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    console.error('Delete gallery item error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete gallery item' });
  }
};
