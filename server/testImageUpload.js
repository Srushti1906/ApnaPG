const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

// Test image upload
const testImageUpload = async () => {
  try {
    // Create a test directory and file if it doesn't exist
    const testDir = path.join(__dirname, 'test-images');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir);
    }

    // Create a simple test image (1x1 pixel PNG)
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
      0x89, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x44, 0x41, 0x54, 0x08, 0x5b, 0x63, 0xf8, 0x0f, 0x00, 0x00,
      0x01, 0x01, 0x00, 0x01, 0x18, 0xdd, 0x8d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44,
      0xae, 0x42, 0x60, 0x82
    ]);

    const testImagePath = path.join(testDir, 'test1.png');
    fs.writeFileSync(testImagePath, pngBuffer);

    console.log('📸 Test image created at:', testImagePath);

    // Get token for authentication (using a test token)
    // In real scenario, you'd need a valid JWT token
    const token = 'test-token'; // This will fail because we need a real token

    // Create FormData
    const form = new FormData();
    form.append('images', fs.createReadStream(testImagePath), 'test1.png');

    console.log('\n📤 Attempting to upload image to /api/pgs/69db33464ea8a98d1c8e123c/upload-images');

    const response = await axios.post(
      'http://localhost:5000/api/pgs/69db33464ea8a98d1c8e123c/upload-images',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('✅ Upload Response:', response.data);
  } catch (error) {
    console.error('❌ Upload Error:');
    console.error('   Status:', error.response?.status);
    console.error('   Message:', error.response?.data?.message || error.message);
    console.error('   Full Response:', error.response?.data);
  }
};

testImageUpload();
