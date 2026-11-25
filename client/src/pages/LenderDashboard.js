/* src/pages/LenderDashboard.js */
import React, { useState } from 'react';
import { getLoan, updateStatus, signClosing } from '../services/api';

function LenderDashboard({ userDid }) {
    const [loanId, setLoanId] = useState('');
    const [currentLoan, setCurrentLoan] = useState(null);
    const [message, setMessage] = useState('');

    const fetchLoan = async (e) => {
        e.preventDefault();
        try {
            const res = await getLoan(loanId);
            setCurrentLoan(JSON.parse(res.data.payload));
            setMessage('');
        } catch (err) {
            setMessage('Loan not found');
            setCurrentLoan(null);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await updateStatus(loanId, newStatus, userDid);
            setMessage(`Status updated to ${newStatus}`);
            fetchLoan({ preventDefault: () => { } });
        } catch (err) {
            setMessage(`Error: ${err.response?.data?.error || err.message}`);
        }
    };

    const handleSignClosing = async () => {
        try {
            // Simulate signing - in real app, this would be a crypto signature of the loan state
            const signature = `sig-lender-${Date.now()}`;
            await signClosing(loanId, 'Lender', userDid, signature);
            setMessage('Signed for closing!');
            fetchLoan({ preventDefault: () => { } });
        } catch (err) {
            setMessage(`Error: ${err.response?.data?.error || err.message}`);
        }
    };

    return (
        <div className="dashboard">
            <h2>Lender Dashboard</h2>
            <div className="card">
                <form onSubmit={fetchLoan}>
                    <div className="form-group">
                        <label>Enter Loan ID to Review</label>
                        <input value={loanId} onChange={e => setLoanId(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn">Fetch Loan</button>
                </form>
                <p>{message}</p>
            </div>

            {currentLoan && (
                <div className="card">
                    <h3>Loan Details: {currentLoan.loanId}</h3>
                    <p><strong>Borrower:</strong> {currentLoan.borrowerDid}</p>
                    <p><strong>Amount:</strong> {currentLoan.amount}</p>
                    <p><strong>Status:</strong> {currentLoan.status}</p>

                    <h4>Documents</h4>
                    <ul>
                        {currentLoan.documents.map((doc, idx) => (
                            <li key={idx}>[{doc.timestamp}] <strong>{doc.type}</strong>: {doc.hash}</li>
                        ))}
                    </ul>

                    <div className="actions">
                        <h4>Actions</h4>
                        {currentLoan.status === 'Submitted' && (
                            <button className="btn" onClick={() => handleStatusChange('Approved')}>Approve Loan</button>
                        )}
                        {currentLoan.status === 'Approved' && (
                            <button className="btn" onClick={() => handleStatusChange('Closing')}>Move to Closing</button>
                        )}
                        {currentLoan.status === 'Closing' && (
                            <button className="btn" onClick={handleSignClosing}>Sign Closing Docs</button>
                        )}
                    </div>

                    {currentLoan.signatures && currentLoan.signatures.length > 0 && (
                        <div>
                            <h4>Signatures</h4>
                            <ul>
                                {currentLoan.signatures.map((s, i) => (
                                    <li key={i}>{s.role}: {s.signature}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default LenderDashboard;
