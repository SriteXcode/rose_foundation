const express = require('express');
const { getDashboard, getUsers, deleteUser, updateUser } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/dashboard', authMiddleware, adminMiddleware, getDashboard);
router.get('/users', authMiddleware, adminMiddleware, getUsers);
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUser);
router.put('/users/:id', authMiddleware, adminMiddleware, updateUser);

module.exports = router;