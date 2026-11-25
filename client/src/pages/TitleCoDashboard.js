/* src/pages/TitleCoDashboard.js */
import React, { useState } from 'react';
import { getLoan, updateStatus, signClosing } from '../services/api';

function TitleCoDashboard({ userDid }) {
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

    const handleSignClosing = async () => {
        try {
            const signature = `sig-title-${Date.now()}`;
            await signClosing(loanId, 'TitleCo', userDid, signature);
            setMessage('Signed for closing!');
            fetchLoan({ preventDefault: () => { } });
        } catch (err) {
            setMessage(`Error: ${err.response?.data?.error || err.message}`);
        }
    };

    const handleFinalize = async () => {
        try {
            await updateStatus(loanId, 'Closed', userDid);
            setMessage('Loan Closed Successfully!');
            fetchLoan({ preventDefault: () => { } });
        } catch (err) {
            setMessage(`Error: ${err.response?.data?.error || err.message}`);
        }
    };

    return (
        <div className="dashboard">
            <h2>Title Company Dashboard</h2>
            <div className="card">
                <form onSubmit={fetchLoan}>
                    <div className="form-group">
                        <label>Enter Loan ID</label>
                        <input value={loanId} onChange={e => setLoanId(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn">Fetch Loan</button>
                </form>
                <p>{message}</p>
            </div>

            {currentLoan && (
                <div className="card">
                    <h3>Loan Details: {currentLoan.loanId}</h3>
                    <p><strong>Status:</strong> {currentLoan.status}</p>

                    <div className="actions">
                        <h4>Actions</h4>
                        {currentLoan.status === 'Closing' && (
                            <>
                                <button className="btn" onClick={handleSignClosing}>Sign Closing Docs</button>
                                <br /><br />
                                <button className="btn btn-secondary" onClick={handleFinalize}>Finalize & Close Loan</button>
                            </>
                        )}
                        {currentLoan.status === 'Closed' && (
                            <p style={{ color: 'green', fontWeight: 'bold' }}>This loan is CLOSED.</p>
                        )}
                    </div>

                    {currentLoan.signatures && (
                        <div>
                            <h4>Signatures Needed: Borrower, Lender, TitleCo</h4>
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

export default TitleCoDashboard;
