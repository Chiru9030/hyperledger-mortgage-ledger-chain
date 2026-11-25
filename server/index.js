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

app.get('/', (req, res) => {
    res.send('Mortgage Ledger Chain API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
