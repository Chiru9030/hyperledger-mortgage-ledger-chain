/* src/services/api.js */
import axios from 'axios';

const API_URL = 'http://localhost:3001/api/loans';

export const createLoan = async (loanData) => {
    return axios.post(`${API_URL}/`, loanData);
};

export const uploadDocument = async (loanId, docType, uploaderDid, file) => {
    const formData = new FormData();
    formData.append('loanId', loanId);
    formData.append('docType', docType);
    formData.append('uploaderDid', uploaderDid);
    formData.append('file', file);

    return axios.post(`${API_URL}/document`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const updateStatus = async (loanId, newStatus, actorDid) => {
    return axios.put(`${API_URL}/status`, { loanId, newStatus, actorDid });
};

export const signClosing = async (loanId, role, actorDid, signature) => {
    return axios.post(`${API_URL}/sign`, { loanId, role, actorDid, signature });
};

export const getLoan = async (loanId) => {
    return axios.get(`${API_URL}/${loanId}`);
};
