/* src/routes/loanRoutes.js */
const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const multer = require('multer');
const path = require('path');

// Configure Multer for file uploads
const upload = multer({ dest: path.join(__dirname, '..', '..', 'uploads') });

router.post('/', loanController.createLoan);
router.post('/document', upload.single('file'), loanController.uploadDocument);
router.put('/status', loanController.updateStatus);
router.post('/sign', loanController.signClosing);
router.get('/:loanId', loanController.getLoan);

module.exports = router;
