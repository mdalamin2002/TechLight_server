// Test script for Product Review API endpoints - Fixed Version
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data - using a real product ID format
const testProductId = '507f1f77bcf86cd799439011'; // Replace with actual product ID
const testReview = {
  productId: testProductId,
  rating: 5,
  title: 'Great product!',
  comment: 'This is an excellent product that exceeded my expectations. Highly recommended!'
};

async function testReviewAPI() {
  try {
    console.log('🧪 Testing Product Review API - Fixed Version...\n');

    // Test 1: Get reviews for a product (should work without auth)
    console.log('1. Testing GET reviews for product...');
    try {
      const getResponse = await axios.get(`${BASE_URL}/reviews/product/${testProductId}`);
      console.log('✅ Get reviews successful:', getResponse.data);
    } catch (error) {
      console.log('❌ Get reviews failed:', error.response?.data || error.message);
    }

    // Test 2: Mark review as helpful (should work without auth)
    console.log('\n2. Testing MARK helpful...');
    try {
      const helpfulResponse = await axios.patch(`${BASE_URL}/reviews/test-review-id/helpful`);
      console.log('✅ Mark helpful successful:', helpfulResponse.data);
    } catch (error) {
      console.log('❌ Mark helpful failed:', error.response?.data || error.message);
    }

    console.log('\n📝 Note: Create, Update, Delete, and Get User Review require authentication.');
    console.log('🔧 To test authenticated endpoints, you need to:');
    console.log('   1. Login through the frontend');
    console.log('   2. Get the JWT token from browser dev tools');
    console.log('   3. Use the token in Authorization header: "Bearer <token>"');

    console.log('\n🎉 Basic API testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testReviewAPI();
