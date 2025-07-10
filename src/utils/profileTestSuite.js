// Test file to verify user profile functionality
// This can be run manually to test the API endpoints

const testProfile = {
  userId: "test-user-123",
  nickname: "TestUser",
  avatar: "🎯|linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  bio: "This is a test user profile for the Excel Analytics Platform.",
  email: "test@example.com",
  phone: "+1 (555) 123-4567",
  jobTitle: "Data Analyst",
  company: "Test Company",
  department: "Analytics",
  location: "New York, NY",
  socialLinks: {
    twitter: "https://twitter.com/testuser",
    linkedin: "https://linkedin.com/in/testuser",
    github: "https://github.com/testuser",
    website: "https://testuser.com"
  },
  preferences: {
    theme: "light",
    language: "en",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    notifications: {
      email: true,
      push: true,
      marketing: false,
      updates: true
    },
    privacy: {
      profileVisibility: "private",
      showEmail: false,
      showOnlineStatus: true
    },
    dashboard: {
      defaultView: "grid",
      chartsPerPage: 12,
      autoSaveCharts: true,
      showTutorials: true
    }
  }
};

// Test functions
const testAPI = {
  baseURL: 'http://localhost:5000',
  
  // Test profile creation
  async createProfile() {
    try {
      const response = await fetch(`${this.baseURL}/user-profile/${testProfile.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testProfile)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Profile created successfully:', data);
        return data;
      } else {
        const error = await response.json();
        console.error('❌ Profile creation failed:', error);
        return null;
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      return null;
    }
  },

  // Test profile retrieval
  async getProfile(userId = testProfile.userId) {
    try {
      const response = await fetch(`${this.baseURL}/user-profile/${userId}?email=${testProfile.email}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Profile retrieved successfully:', data);
        return data;
      } else {
        const error = await response.json();
        console.error('❌ Profile retrieval failed:', error);
        return null;
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      return null;
    }
  },

  // Test nickname availability
  async checkNickname(nickname = "TestUser123") {
    try {
      const response = await fetch(`${this.baseURL}/user-profile/check-nickname`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname, userId: testProfile.userId })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Nickname check successful:', data);
        return data;
      } else {
        const error = await response.json();
        console.error('❌ Nickname check failed:', error);
        return null;
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      return null;
    }
  },

  // Test avatar generation
  async getRandomAvatar() {
    try {
      const response = await fetch(`${this.baseURL}/user-profile/avatar/random`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Random avatar generated:', data);
        return data;
      } else {
        const error = await response.json();
        console.error('❌ Avatar generation failed:', error);
        return null;
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      return null;
    }
  },

  // Test nickname generation
  async getRandomNickname() {
    try {
      const response = await fetch(`${this.baseURL}/user-profile/nickname/random`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Random nickname generated:', data);
        return data;
      } else {
        const error = await response.json();
        console.error('❌ Nickname generation failed:', error);
        return null;
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      return null;
    }
  },

  // Test all avatars retrieval
  async getAllAvatars() {
    try {
      const response = await fetch(`${this.baseURL}/user-profile/avatars/all`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ All avatars retrieved:', `${data.avatars.length} avatars available`);
        return data;
      } else {
        const error = await response.json();
        console.error('❌ Avatar retrieval failed:', error);
        return null;
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      return null;
    }
  },

  // Run all tests
  async runAllTests() {
    console.log('🧪 Starting API tests...\n');
    
    // Test 1: Random avatar generation
    console.log('Test 1: Random Avatar Generation');
    await this.getRandomAvatar();
    console.log('');
    
    // Test 2: Random nickname generation
    console.log('Test 2: Random Nickname Generation');
    await this.getRandomNickname();
    console.log('');
    
    // Test 3: All avatars retrieval
    console.log('Test 3: All Avatars Retrieval');
    await this.getAllAvatars();
    console.log('');
    
    // Test 4: Nickname availability check
    console.log('Test 4: Nickname Availability Check');
    await this.checkNickname();
    console.log('');
    
    // Test 5: Profile creation
    console.log('Test 5: Profile Creation');
    await this.createProfile();
    console.log('');
    
    // Test 6: Profile retrieval
    console.log('Test 6: Profile Retrieval');
    await this.getProfile();
    console.log('');
    
    console.log('🧪 All tests completed!');
  }
};

// Export for use in browser console or Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testAPI, testProfile };
} else {
  // Browser environment - attach to window
  window.testAPI = testAPI;
  window.testProfile = testProfile;
}

// Instructions for testing:
console.log(`
🧪 Profile API Test Suite
=========================

To run tests, use the following commands in your browser console:

1. Test all endpoints:
   testAPI.runAllTests()

2. Test individual endpoints:
   testAPI.getRandomAvatar()
   testAPI.getRandomNickname()
   testAPI.getAllAvatars()
   testAPI.checkNickname("YourNickname")
   testAPI.createProfile()
   testAPI.getProfile()

3. View test data:
   console.log(testProfile)

Make sure your backend server is running on http://localhost:5000
`);
