// Test script for User Orders API
// Run this with: node test-user-orders-api.js

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/user/orders';

// You'll need to replace this with a valid Firebase token
const FIREBASE_TOKEN = 'YOUR_FIREBASE_TOKEN_HERE';

const headers = {
  'Authorization': `Bearer ${FIREBASE_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testUserOrdersAPI() {
  console.log('🧪 Testing User Orders API...\n');

  try {
    // Test 1: Get user orders with pagination
    console.log('1️⃣ Testing: Get user orders with pagination');
    const ordersResponse = await axios.get(`${BASE_URL}?page=1&limit=5`, { headers });
    console.log('✅ Success:', ordersResponse.data.success);
    console.log('📊 Orders count:', ordersResponse.data.data.orders.length);
    console.log('📄 Pagination:', ordersResponse.data.data.pagination);
    console.log('');

    // Test 2: Get user order statistics
    console.log('2️⃣ Testing: Get user order statistics');
    const statsResponse = await axios.get(`${BASE_URL}/stats/summary`, { headers });
    console.log('✅ Success:', statsResponse.data.success);
    console.log('📈 Stats:', statsResponse.data.data);
    console.log('');

    // Test 3: Filter orders by status
    console.log('3️⃣ Testing: Filter orders by status');
    const filteredResponse = await axios.get(`${BASE_URL}?status=Completed&limit=3`, { headers });
    console.log('✅ Success:', filteredResponse.data.success);
    console.log('🔍 Filtered orders:', filteredResponse.data.data.orders.length);
    console.log('');

    // Test 4: Sort orders by amount
    console.log('4️⃣ Testing: Sort orders by amount');
    const sortedResponse = await axios.get(`${BASE_URL}?sortBy=totalAmount&sortOrder=desc&limit=3`, { headers });
    console.log('✅ Success:', sortedResponse.data.success);
    console.log('💰 Sorted orders:', sortedResponse.data.data.orders.length);
    console.log('');

    // Test 5: Date range filtering
    console.log('5️⃣ Testing: Date range filtering');
    const dateFilteredResponse = await axios.get(`${BASE_URL}?startDate=2024-01-01&endDate=2024-12-31`, { headers });
    console.log('✅ Success:', dateFilteredResponse.data.success);
    console.log('📅 Date filtered orders:', dateFilteredResponse.data.data.orders.length);
    console.log('');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Make sure to replace FIREBASE_TOKEN with a valid token');
    }
  }
}

// Run the tests
testUserOrdersAPI();
