const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5001',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTczNzU1NzI5MywianRpIjoiYzQzYzQzYzQtYzQzYy00YzQzLWM0M2MtYzQzYzQzYzQzYzQzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNzM3NTU3MjkzLCJjc3JmIjoiYzQzYzQzYzQtYzQzYy00YzQzLWM0M2MtYzQzYzQzYzQzYzQzIiwiZXhwIjoxNzM3NjQzNjkzfQ.test'
  },
  timeout: 5000,
});

async function testEndpoints() {
  const endpoints = ['/patients', '/clinical/appointments', '/medications/prescriptions', '/billing/invoices'];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint}...`);
      const response = await api.get(endpoint);
      console.log(`✓ ${endpoint}: ${response.status} - ${response.data.length || 'N/A'} items`);
    } catch (error) {
      console.log(`✗ ${endpoint}: ${error.response?.status || 'ERROR'} - ${error.response?.data?.error || error.message}`);
    }
  }
}

testEndpoints();