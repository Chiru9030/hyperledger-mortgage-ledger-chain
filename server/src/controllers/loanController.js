/* src/controllers/loanController.js */
const { connectGateway } = require('../config/fabric');
const { calculateHash } = require('../utils/fileUtils');
const fs = require('fs');
const path = require('path');

// Simulated S3 bucket - local directory
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// In-Memory Ledger for High-Fidelity Standalone / Cloud Demonstration
const simulatedLedger = new Map([
    ['LOAN-1001', {
        id: 'LOAN-1001',
        borrowerDid: 'did:key:z6MkuT...borrower',
        status: 'SUBMITTED',
        amount: 485000,
        propertyAddress: '742 Evergreen Terrace, Springfield, OR',
        documents: {},
        signatures: {}
    }],
    ['LOAN-1002', {
        id: 'LOAN-1002',
        borrowerDid: 'did:key:z6MkqB...borrower',
        status: 'TITLE_CLEARED',
        amount: 720000,
        propertyAddress: '1204 Beacon St, Boston, MA',
        documents: {
            TITLE_REPORT: '0x8f4d92a1bc83e2049bf5728a1c990234a9b21f9c8d7e6f5a4b3c2d1e0f9a8b7c'
        },
        signatures: {
            TITLE_OFFICER: 'SIG-VERIFIED-CADASTRE-TITLE-CO-01'
        }
    }]
]);

// Helper to interact with chaincode or fallback to simulation
async function submitTransaction(userId, func, ...args) {
    try {
        const { gateway, contract } = await connectGateway(userId);
        if (contract) {
            const result = await contract.submitTransaction(func, ...args);
            await gateway.disconnect();
            return JSON.parse(result.toString());
        }
    } catch (error) {
        console.warn(`[Fabric Gateway Notice] Real Fabric network unavailable (${error.message}). Falling back to simulation mode.`);
    }

    // High-Fidelity Simulation Execution
    if (func === 'createLoan') {
        const [loanId, borrowerDid, detailsStr] = args;
        const details = JSON.parse(detailsStr || '{}');
        const loan = {
            id: loanId,
            borrowerDid,
            status: 'SUBMITTED',
            amount: details.amount || 0,
            propertyAddress: details.propertyAddress || '',
            documents: {},
            signatures: {},
            createdAt: new Date()
        };
        simulatedLedger.set(loanId, loan);
        return loan;
    } else if (func === 'uploadDocumentHash') {
        const [loanId, docType, docHash, uploaderDid] = args;
        const loan = simulatedLedger.get(loanId) || { id: loanId, status: 'SUBMITTED', documents: {}, signatures: {} };
        loan.documents[docType] = { hash: docHash, uploader: uploaderDid, timestamp: new Date() };
        simulatedLedger.set(loanId, loan);
        return loan;
    } else if (func === 'updateLoanStatus') {
        const [loanId, newStatus, actorDid] = args;
        const loan = simulatedLedger.get(loanId);
        if (loan) {
            loan.status = newStatus;
            loan.lastUpdatedBy = actorDid;
        }
        return loan;
    } else if (func === 'signClosing') {
        const [loanId, role, actorDid, signature] = args;
        const loan = simulatedLedger.get(loanId);
        if (loan) {
            loan.signatures[role] = { actor: actorDid, sig: signature, signedAt: new Date() };
            if (Object.keys(loan.signatures).length >= 2) {
                loan.status = 'FUNDED';
            }
        }
        return loan;
    }

    return { success: true, message: 'Executed in simulation mode' };
}

async function evaluateTransaction(userId, func, ...args) {
    try {
        const { gateway, contract } = await connectGateway(userId);
        if (contract) {
            const result = await contract.evaluateTransaction(func, ...args);
            await gateway.disconnect();
            return JSON.parse(result.toString());
        }
    } catch (error) {
        console.warn(`[Fabric Query Notice] Real Fabric network unavailable. Falling back to simulation.`);
    }

    if (func === 'queryLoan') {
        const [loanId] = args;
        return simulatedLedger.get(loanId) || null;
    }

    return Array.from(simulatedLedger.values());
}

exports.createLoan = async (req, res) => {
    try {
        const { loanId, borrowerDid, amount, propertyAddress } = req.body;
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
        const file = req.file;

        let docHash = '0x' + Math.random().toString(36).substr(2, 16);
        if (file && fs.existsSync(file.path)) {
            const fileBuffer = fs.readFileSync(file.path);
            docHash = calculateHash(fileBuffer);
        }

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
        if (!result) {
            return res.status(404).json({ success: false, message: 'Loan not found' });
        }
        res.json({ success: true, payload: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.listLoans = async (req, res) => {
    try {
        const loans = Array.from(simulatedLedger.values());
        res.json({ success: true, count: loans.length, payload: loans });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
