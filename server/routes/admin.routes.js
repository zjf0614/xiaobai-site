const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/admin/stats', auth, admin, adminController.getStats);

router.get('/admin/users', auth, admin, adminController.getUsers);
router.get('/admin/users/:userId', auth, admin, adminController.getUserById);
router.patch('/admin/users/:userId/role', auth, admin, adminController.updateUserRole);
router.delete('/admin/users/:userId', auth, admin, adminController.deleteUser);

router.get('/admin/messages/public', auth, admin, adminController.getPublicMessages);
router.delete('/admin/messages/public/:messageId', auth, admin, adminController.deletePublicMessage);

router.get('/admin/messages/private', auth, admin, adminController.getPrivateMessages);
router.delete('/admin/messages/private/:messageId', auth, admin, adminController.deletePrivateMessage);

router.get('/admin/logs', auth, admin, adminController.getAdminLogs);

module.exports = router;