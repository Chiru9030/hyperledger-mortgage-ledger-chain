# MortgageLedgerChain — Hyperledger Fabric Mortgage Origination Ledger ⛓️🏠

A decentralized, tamper-resistant mortgage loan origination and title verification platform engineered on **Hyperledger Fabric**. It coordinates multi-party approvals among **Borrowers**, **Lending Institutions**, and **Title Companies** through immutable smart contracts (chaincode).

---

## 🌟 Key Capabilities

- **Multi-Party Consensus & Governance:** Enforces strict role separation across Lender, Borrower, and Title Company participants.
- **Automated Title Clearance:** Title company smart contract verification guarantees clear title prior to loan approval.
- **Immutable Audit Trail:** Every status change, valuation update, and lien registration is immutably committed to the Fabric distributed ledger.
- **Tamper Verification Suite:** Built-in shell script (`Tamper_Test.sh`) simulating unauthorized state modification and verifying Fabric's cryptographic rejection.
- **Role-Specific Dashboards:** Dedicated React portals for Lenders (loan review & approval), Borrowers (application submission & status), and Title Companies (deed clearance).

---

## 🏗 Architecture & Stack

```
mortgage-ledger-chain/
├── chaincode/                # Hyperledger Fabric Smart Contracts (Node.js)
│   ├── lib/loan-contract.js  # Mortgage lifecycle & state transitions
│   └── package.json
├── server/                   # Express REST API (Fabric SDK Gateway)
│   ├── src/config/fabric.js  # Gateway client & wallet connection
│   ├── src/controllers/      # Loan creation, title sign-off, funding
│   └── index.js
├── client/                   # React Web Application
│   ├── src/pages/            # Lender, Borrower, TitleCo Dashboards
│   └── src/services/api.js   # API client
└── Tamper_Test.sh            # Cryptographic integrity verification suite
```

- **Blockchain Engine:** Hyperledger Fabric 2.x
- **Smart Contract Language:** Node.js Fabric Contract API (`fabric-contract-api`)
- **Backend API:** Node.js, Express.js, Fabric Network SDK (`fabric-network`)
- **Frontend:** React, CSS Modules, Axios

---

## 🚀 Quick Start

### 1. Prerequisites
- Docker & Docker Compose
- Node.js (v16+)
- Hyperledger Fabric Test Network binaries

---

### 2. Deploy Smart Contract (Chaincode)
```bash
# Package and install chaincode on Fabric peer
peer lifecycle chaincode package mortgage_cc.tar.gz --path ./chaincode --lang node --label mortgage_1.0
peer lifecycle chaincode install mortgage_cc.tar.gz
```

---

### 3. Start Backend Gateway
```bash
cd server
npm install
node index.js
```
The REST API gateway runs on `http://localhost:4000`.

---

### 4. Start Client UI
```bash
cd ../client
npm install
npm start
```
The React portal opens at `http://localhost:3000`.

---

### 5. Run Tamper Verification Test
```bash
chmod +x Tamper_Test.sh
./Tamper_Test.sh
```

---

## 📄 License
Licensed under the [MIT License](LICENSE).
