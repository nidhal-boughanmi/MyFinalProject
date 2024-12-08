const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const auth = require('../middleware/auth');

// Routes protégées nécessitant une authentification
router.post('/admin/export/pdf', auth, exportController.exportToPdf);
router.post('/admin/export/excel', auth, exportController.exportToExcel);

module.exports = router;
