const express = require('express');
const { submitContact, getContacts } = require('../controllers/contactController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/', submitContact);
router.get('/', authMiddleware, adminMiddleware, getContacts);

module.exports = router;
