/* src/pages/BorrowerDashboard.js */
import React, { useState } from 'react';
import { createLoan, uploadDocument, getLoan } from '../services/api';

function BorrowerDashboard({ userDid }) {
    const [loanId, setLoanId] = useState('');
    const [amount, setAmount] = useState('');
    const [propertyAddress, setPropertyAddress] = useState('');
    const [currentLoan, setCurrentLoan] = useState(null);
    const [file, setFile] = useState(null);
    const [docType, setDocType] = useState('Income Proof');
    const [message, setMessage] = useState('');

    const handleCreateLoan = async (e) => {
        e.preventDefault();
        try {
            await createLoan({ loanId, borrowerDid: userDid, amount, propertyAddress });
            setMessage('Loan Created Successfully!');
            fetchLoanDetails();
        } catch (err) {
            setMessage(`Error: ${err.response?.data?.error || err.message}`);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !loanId) return;
        try {
            const res = await uploadDocument(loanId, docType, userDid, file);
            setMessage(`Document Uploaded! Hash: ${res.data.fileHash}`);
            fetchLoanDetails();
        } catch (err) {
            setMessage(`Error: ${err.response?.data?.error || err.message}`);
        }
    };

    const fetchLoanDetails = async () => {
        if (!loanId) return;
        try {
            const res = await getLoan(loanId);
            setCurrentLoan(JSON.parse(res.data.payload));
        } catch (err) {
            console.error(err);
            // setMessage('Loan not found yet.');
        }
    };

    return (
        <div className="dashboard">
            <h2>Borrower Dashboard</h2>
            <p>{message}</p>

            <div className="card">
                <h3>Apply for a Loan</h3>
                <form onSubmit={handleCreateLoan}>
                    <div className="form-group">
                        <label>Loan ID (Unique)</label>
                        <input value={loanId} onChange={e => setLoanId(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Amount</label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Property Address</label>
                        <input value={propertyAddress} onChange={e => setPropertyAddress(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn">Create Loan Application</button>
                </form>
            </div>

            <div className="card">
                <h3>Upload Documents for Loan: {loanId}</h3>
                <form onSubmit={handleUpload}>
                    <div className="form-group">
                        <label>Document Type</label>
                        <select value={docType} onChange={e => setDocType(e.target.value)}>
                            <option>Income Proof</option>
                            <option>Identity Proof</option>
                            <option>Property Deed</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <input type="file" onChange={e => setFile(e.target.files[0])} />
                    </div>
                    <button type="submit" className="btn btn-secondary">Upload Document</button>
                </form>
            </div>

            {currentLoan && (
                <div className="card">
                    <h3>Loan Status: {currentLoan.status}</h3>
                    <p><strong>Amount:</strong> {currentLoan.amount}</p>
                    <p><strong>Address:</strong> {currentLoan.propertyAddress}</p>
                    <h4>Uploaded Documents (Hashes)</h4>
                    <ul>
                        {currentLoan.documents && currentLoan.documents.map((doc, idx) => (
                            <li key={idx}>{doc.type}: {doc.hash} (by {doc.uploadedBy})</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default BorrowerDashboard;
