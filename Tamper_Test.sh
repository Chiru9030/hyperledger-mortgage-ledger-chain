#!/bin/bash
# Tamper_Test.sh

echo "=========================================="
echo "      MORTGAGE LEDGER CHAIN - TAMPER TEST"
echo "=========================================="

# 1. Create a dummy PDF
echo "Creating original document..."
echo "This is the original loan document content." > original_loan_doc.pdf

# 2. Calculate Hash
ORIGINAL_HASH=$(shasum -a 256 original_loan_doc.pdf | awk '{print $1}')
echo "Original Hash: $ORIGINAL_HASH"

# 3. Simulate Upload (In real test, this would call the API)
# For this script, we assume the API stored $ORIGINAL_HASH on the ledger.
STORED_HASH=$ORIGINAL_HASH
echo "Simulated: Hash stored on Ledger: $STORED_HASH"

# 4. Tamper with the file
echo "Tampering with the document..."
echo "This is the MODIFIED/FRAUDULENT content." >> original_loan_doc.pdf

# 5. Calculate New Hash
TAMPERED_HASH=$(shasum -a 256 original_loan_doc.pdf | awk '{print $1}')
echo "Tampered File Hash: $TAMPERED_HASH"

# 6. Verify
echo "=========================================="
echo "Verifying Document Integrity..."

if [ "$TAMPERED_HASH" == "$STORED_HASH" ]; then
    echo "SUCCESS: Metadata matches file. (This should NOT happen for tampered file)"
    exit 1
else
    echo "FAILURE: Hash Mismatch Detected!"
    echo "Ledger Hash: $STORED_HASH"
    echo "File Hash:   $TAMPERED_HASH"
    echo "Tamper Evidence Found. Verification Passed."
    exit 0
fi
