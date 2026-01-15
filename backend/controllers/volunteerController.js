const Volunteer = require('../models/Volunteer');

// Add volunteer
exports.addVolunteer = async (req, res) => {
  try {
    const { name, designation, image } = req.body;
    if (!name || !designation || !image) {
      return res.status(400).json({ error: 'Name, designation, and image are required' });
    }

    const volunteer = new Volunteer({
      name, 
      designation, 
      image
    });

    await volunteer.save();
    res.status(201).json({ message: 'Volunteer added!', volunteer });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add volunteer' });
  }
};

// Get volunteers
exports.getVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.find().sort({ createdAt: -1 });
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch volunteers' });
  }
};

// Update volunteer
exports.updateVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedVolunteer = await Volunteer.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!updatedVolunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }
    
    res.json({ message: 'Volunteer updated successfully', volunteer: updatedVolunteer });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update volunteer' });
  }
};

// Delete volunteer
exports.deleteVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVolunteer = await Volunteer.findByIdAndDelete(id);
    
    if (!deletedVolunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }
    
    res.json({ message: 'Volunteer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete volunteer' });
  }
};