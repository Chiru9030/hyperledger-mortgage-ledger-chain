/* src/controllers/loanController.js */
const { connectGateway } = require('../config/fabric');
const { calculateHash } = require('../utils/fileUtils');
const fs = require('fs');
const path = require('path');

// Simulated S3 bucket - local directory
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}

// Helper to interact with chaincode
async function submitTransaction(userId, func, ...args) {
    try {
        const { gateway, contract } = await connectGateway(userId);
        const result = await contract.submitTransaction(func, ...args);
        await gateway.disconnect();
        return JSON.parse(result.toString());
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        throw error;
    }
}

async function evaluateTransaction(userId, func, ...args) {
    try {
        const { gateway, contract } = await connectGateway(userId);
        const result = await contract.evaluateTransaction(func, ...args);
        await gateway.disconnect();
        return JSON.parse(result.toString());
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        throw error;
    }
}

exports.createLoan = async (req, res) => {
    try {
        const { loanId, borrowerDid, amount, propertyAddress } = req.body;
        // In real app, userId comes from auth token. Here simulating 'admin' or specific user
        const userId = 'appUser';

        const details = JSON.stringify({ amount, propertyAddress, lenderDid: '' });

        const result = await submitTransaction(userId, 'createLoan', loanId, borrowerDid, details);
        res.json({ success: true, payload: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.uploadDocument = async (req, res) => {
    try {
        const { loanId, docType, uploaderDid } = req.body;
        const file = req.file; // From multer

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // 1. Calculate Hash
        const fileBuffer = fs.readFileSync(file.path);
        const docHash = calculateHash(fileBuffer);

        // 2. Store File (Simulate S3)
        // Already stored by multer? We can rename it or keep it.
        // For simulation, we assume file.path is the stored location.

        // 3. Store Hash on Ledger
        const userId = 'appUser';
        const result = await submitTransaction(userId, 'uploadDocumentHash', loanId, docType, docHash, uploaderDid);

        res.json({ success: true, payload: result, fileHash: docHash });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { loanId, newStatus, actorDid } = req.body;
        const userId = 'appUser';

        const result = await submitTransaction(userId, 'updateLoanStatus', loanId, newStatus, actorDid);
        res.json({ success: true, payload: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.signClosing = async (req, res) => {
    try {
        const { loanId, role, actorDid, signature } = req.body;
        const userId = 'appUser';

        const result = await submitTransaction(userId, 'signClosing', loanId, role, actorDid, signature);
        res.json({ success: true, payload: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getLoan = async (req, res) => {
    try {
        const { loanId } = req.params;
        const userId = 'appUser';

        const result = await evaluateTransaction(userId, 'queryLoan', loanId);
        res.json({ success: true, payload: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
