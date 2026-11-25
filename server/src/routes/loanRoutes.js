const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Mortgage Lifecycle Endpoints
router.get('/', loanController.listLoans);
router.post('/create', loanController.createLoan);
router.post('/upload-doc', upload.single('document'), loanController.uploadDocument);
router.post('/status', loanController.updateStatus);
router.post('/sign', loanController.signClosing);
router.get('/:loanId', loanController.getLoan);

module.exports = router;
