// Test script for Product Review API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testProductId = '507f1f77bcf86cd799439011'; // Replace with actual product ID
const testReview = {
  productId: testProductId,
  userId: 'test@example.com',
  userName: 'Test User',
  userEmail: 'test@example.com',
  rating: 5,
  title: 'Great product!',
  comment: 'This is an excellent product that exceeded my expectations. Highly recommended!'
};

async function testReviewAPI() {
  try {
    console.log('🧪 Testing Product Review API...\n');

    // Test 1: Create a review
    console.log('1. Testing CREATE review...');
    try {
      const createResponse = await axios.post(`${BASE_URL}/reviews`, testReview);
      console.log('✅ Create review successful:', createResponse.data);
    } catch (error) {
      console.log('❌ Create review failed:', error.response?.data || error.message);
    }

    // Test 2: Get reviews for a product
    console.log('\n2. Testing GET reviews for product...');
    try {
      const getResponse = await axios.get(`${BASE_URL}/reviews/product/${testProductId}`);
      console.log('✅ Get reviews successful:', getResponse.data);
    } catch (error) {
      console.log('❌ Get reviews failed:', error.response?.data || error.message);
    }

    // Test 3: Get user's review
    console.log('\n3. Testing GET user review...');
    try {
      const userReviewResponse = await axios.get(`${BASE_URL}/reviews/user/${testProductId}?userId=${testReview.userId}`);
      console.log('✅ Get user review successful:', userReviewResponse.data);
    } catch (error) {
      console.log('❌ Get user review failed:', error.response?.data || error.message);
    }

    // Test 4: Mark review as helpful
    console.log('\n4. Testing MARK helpful...');
    try {
      const helpfulResponse = await axios.patch(`${BASE_URL}/reviews/test-review-id/helpful`);
      console.log('✅ Mark helpful successful:', helpfulResponse.data);
    } catch (error) {
      console.log('❌ Mark helpful failed:', error.response?.data || error.message);
    }

    console.log('\n🎉 API testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testReviewAPI();
