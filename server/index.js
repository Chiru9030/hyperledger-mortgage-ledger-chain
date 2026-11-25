/* index.js */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const loanRoutes = require('./src/routes/loanRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/loans', loanRoutes);

app.get('/api/health', (req, res) => {
    res.json({
        status: 'UP',
        service: 'MortgageLedgerChain Fabric API Gateway',
        network: 'Hyperledger Fabric 2.x (with Automatic Demonstration Fallback)',
        timestamp: new Date()
    });
});

app.get('/', (req, res) => {
    res.json({
        message: 'Mortgage Ledger Chain Fabric API is running',
        health: '/api/health',
        endpoints: ['/api/loans', '/api/loans/:id', '/api/loans/create']
    });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
