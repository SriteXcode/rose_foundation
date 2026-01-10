const Work = require('../models/Work');

// Add work/project
exports.addWork = async (req, res) => {
  try {
    const { title, description, category, location, beneficiaries, status, images, startDate, endDate } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Title, description, and category are required' });
    }

    const work = new Work({
      title, description, category, location, beneficiaries, status,
      images, startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    });

    await work.save();
    res.status(201).json({ message: 'Work/Project added!', work });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add work' });
  }
};

// Get works/projects
exports.getWorks = async (req, res) => {
  try {
    const { category, status } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    const works = await Work.find(filter).sort({ createdAt: -1 });
    res.json(works);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch works' });
  }
};

// Work statistics
exports.getWorkStats = async (req, res) => {
  try {
    const totalBeneficiaries = await Work.aggregate([{ $group: { _id: null, total: { $sum: '$beneficiaries' } } }]);
    const projectsByCategory = await Work.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
    const projectsByStatus = await Work.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

    res.json({
      totalBeneficiaries: totalBeneficiaries[0]?.total || 0,
      projectsByCategory,
      projectsByStatus
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

// Update work/project
exports.updateWork = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedWork = await Work.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!updatedWork) {
      return res.status(404).json({ error: 'Work not found' });
    }
    
    res.json({ message: 'Work updated successfully', work: updatedWork });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update work' });
  }
};

// Delete work/project
exports.deleteWork = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedWork = await Work.findByIdAndDelete(id);
    
    if (!deletedWork) {
      return res.status(404).json({ error: 'Work not found' });
    }
    
    res.json({ message: 'Work deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete work' });
  }
};
