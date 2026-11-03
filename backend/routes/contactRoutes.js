const express = require('express');
const { 
  submitContact, 
  getContacts, 
  deleteContact, 
  updateContactStatus 
} = require('../controllers/contactController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/', submitContact);
router.get('/', authMiddleware, adminMiddleware, getContacts);
router.delete('/:id', authMiddleware, adminMiddleware, deleteContact);
router.patch('/:id/status', authMiddleware, adminMiddleware, updateContactStatus);

module.exports = router;
