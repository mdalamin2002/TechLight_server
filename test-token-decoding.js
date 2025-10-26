// Test script to verify user displayName is properly extracted
const admin = require("firebase-admin");

// Initialize Firebase Admin (you'll need to add your service account key)
// const serviceAccount = require("./path-to-your-service-account-key.json");
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

async function testTokenDecoding() {
  try {
    console.log('🧪 Testing Firebase Token Decoding...\n');

    // This is a sample token - replace with a real token from your frontend
    const sampleToken = "YOUR_FIREBASE_TOKEN_HERE";

    if (sampleToken === "YOUR_FIREBASE_TOKEN_HERE") {
      console.log('📝 To test this:');
      console.log('1. Login to your frontend');
      console.log('2. Open browser dev tools');
      console.log('3. Go to Application/Storage tab');
      console.log('4. Find Firebase token in localStorage');
      console.log('5. Replace sampleToken with the actual token');
      console.log('6. Run this script again');
      return;
    }

    const decoded = await admin.auth().verifyIdToken(sampleToken);

    console.log('✅ Token decoded successfully!');
    console.log('📋 Decoded user data:');
    console.log('  - Email:', decoded.email);
    console.log('  - UID:', decoded.uid);
    console.log('  - Name:', decoded.name);
    console.log('  - Display Name:', decoded.displayName);
    console.log('  - Picture:', decoded.picture);

    // Test the auth middleware logic
    const userData = {
      email: decoded?.email,
      uid: decoded?.uid,
      displayName: decoded?.name || decoded?.displayName,
      photoURL: decoded?.picture || decoded?.photoURL
    };

    console.log('\n🔧 Auth middleware would create:');
    console.log(JSON.stringify(userData, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testTokenDecoding();
