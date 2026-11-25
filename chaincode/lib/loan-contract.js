/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class LoanContract extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        // No initial data for now, or could add a genesis loan
        console.info('============= END : Initialize Ledger =============');
    }

    async createLoan(ctx, loanId, borrowerDid, detailsJSON) {
        console.info('============= START : Create Loan ===========');

        const exists = await this.loanExists(ctx, loanId);
        if (exists) {
            throw new Error(`The loan ${loanId} already exists`);
        }

        const details = JSON.parse(detailsJSON);

        const loan = {
            loanId,
            borrowerDid,
            lenderDid: details.lenderDid || '', // Can be assigned later
            amount: details.amount,
            propertyAddress: details.propertyAddress,
            status: 'Submitted',
            documents: [], // Array of { type, hash, timestamp, uploadedBy }
            history: [],   // Array of { action, status, timestamp, actor }
            signatures: [], // For closing: { role, did, signature, timestamp }
            createdTimestamp: new Date().toISOString()
        };

        // Log creation
        loan.history.push({
            action: 'CREATED',
            status: 'Submitted',
            timestamp: new Date().toISOString(),
            actor: borrowerDid
        });

        await ctx.stub.putState(loanId, Buffer.from(JSON.stringify(loan)));
        console.info('============= END : Create Loan ===========');
        return JSON.stringify(loan);
    }

    async uploadDocumentHash(ctx, loanId, docType, docHash, uploaderDid) {
        console.info('============= START : Upload Document Hash ===========');

        const loanAsBytes = await ctx.stub.getState(loanId);
        if (!loanAsBytes || loanAsBytes.length === 0) {
            throw new Error(`${loanId} does not exist`);
        }
        const loan = JSON.parse(loanAsBytes.toString());

        const docRecord = {
            type: docType,
            hash: docHash,
            timestamp: new Date().toISOString(),
            uploadedBy: uploaderDid
        };

        loan.documents.push(docRecord);

        // Log history
        loan.history.push({
            action: 'DOCUMENT_UPLOADED',
            details: `Uploaded ${docType}`,
            timestamp: new Date().toISOString(),
            actor: uploaderDid
        });

        await ctx.stub.putState(loanId, Buffer.from(JSON.stringify(loan)));
        console.info('============= END : Upload Document Hash ===========');
        return JSON.stringify(loan);
    }

    async updateLoanStatus(ctx, loanId, newStatus, actorDid) {
        console.info('============= START : Update Loan Status ===========');

        const loanAsBytes = await ctx.stub.getState(loanId);
        if (!loanAsBytes || loanAsBytes.length === 0) {
            throw new Error(`${loanId} does not exist`);
        }
        const loan = JSON.parse(loanAsBytes.toString());

        const oldStatus = loan.status;

        // Custom Logic for "Closed" status - Mocking Multi-Sig
        if (newStatus === 'Closed') {
            if (oldStatus !== 'Closing') {
                throw new Error(`Cannot move to Closed from ${oldStatus}. Must be in Closing state.`);
            }

            // Verify signatures (Mock check)
            // Expecting signatures from Borrower, Lender, TitleCo
            // In a real app, verify signatures cryptographically using DIDs. 
            // Here we check if they "signed" (called signClosing).

            const requiredRoles = ['Borrower', 'Lender', 'TitleCo'];
            const signedRoles = loan.signatures.map(s => s.role);

            const missingRoles = requiredRoles.filter(role => !signedRoles.includes(role));

            if (missingRoles.length > 0) {
                throw new Error(`Missing signatures from: ${missingRoles.join(', ')}. Cannot close loan.`);
            }
        }

        loan.status = newStatus;

        loan.history.push({
            action: 'STATUS_CHANGE',
            from: oldStatus,
            to: newStatus,
            timestamp: new Date().toISOString(),
            actor: actorDid
        });

        await ctx.stub.putState(loanId, Buffer.from(JSON.stringify(loan)));
        console.info('============= END : Update Loan Status ===========');
        return JSON.stringify(loan);
    }

    // Helper to simulate signing for multi-sig
    async signClosing(ctx, loanId, role, actorDid, signatureHash) {
        console.info('============= START : Sign Closing ===========');
        const loanAsBytes = await ctx.stub.getState(loanId);
        if (!loanAsBytes || loanAsBytes.length === 0) {
            throw new Error(`${loanId} does not exist`);
        }
        const loan = JSON.parse(loanAsBytes.toString());

        if (loan.status !== 'Closing') {
            throw new Error(`Loan must be in 'Closing' status to sign.`);
        }

        // Check if already signed by this role
        if (loan.signatures.some(s => s.role === role)) {
            throw new Error(`Role ${role} has already signed.`);
        }

        loan.signatures.push({
            role,
            did: actorDid,
            signature: signatureHash, // In real world, verify this against public key
            timestamp: new Date().toISOString()
        });

        loan.history.push({
            action: 'SIGNED',
            role: role,
            timestamp: new Date().toISOString(),
            actor: actorDid
        });

        await ctx.stub.putState(loanId, Buffer.from(JSON.stringify(loan)));
        return JSON.stringify(loan);
    }

    async queryLoan(ctx, loanId) {
        const loanAsBytes = await ctx.stub.getState(loanId);
        if (!loanAsBytes || loanAsBytes.length === 0) {
            throw new Error(`${loanId} does not exist`);
        }
        console.log(loanAsBytes.toString());
        return loanAsBytes.toString();
    }

    async loanExists(ctx, loanId) {
        const loanAsBytes = await ctx.stub.getState(loanId);
        return loanAsBytes && loanAsBytes.length > 0;
    }
}

module.exports = LoanContract;
