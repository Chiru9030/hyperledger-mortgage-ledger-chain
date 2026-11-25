/* src/utils/fileUtils.js */
const crypto = require('crypto');

function calculateHash(buffer) {
    const hash = crypto.createHash('sha256');
    hash.update(buffer);
    return hash.digest('hex');
}

module.exports = { calculateHash };
