const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5001',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

async function testLogin() {
  try {
    console.log('Testing POST login...');
    const response = await api.post('/auth/login', { 
      username: 'admin', 
      password: 'AdminPass123!' 
    });
    console.log('Success:', response.data);
  } catch (error) {
    console.log('Error:', error.response?.status, error.response?.data);
  }
}

testLogin();