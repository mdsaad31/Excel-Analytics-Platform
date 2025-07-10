const router = require('express').Router();
const UserProfile = require('../models/userProfile.model');

// Helper function to generate random nickname
const generateRandomNickname = () => {
  const adjectives = [
    'Awesome', 'Creative', 'Dynamic', 'Energetic', 'Fantastic', 'Genuine', 'Happy', 'Innovative',
    'Joyful', 'Keen', 'Lively', 'Motivated', 'Noble', 'Optimistic', 'Passionate', 'Quick',
    'Radiant', 'Stellar', 'Talented', 'Unique', 'Vibrant', 'Wonderful', 'Extraordinary', 'Zealous'
  ];
  const nouns = [
    'Analyst', 'Builder', 'Creator', 'Developer', 'Explorer', 'Genius', 'Hero', 'Innovator',
    'Journeyer', 'Knight', 'Leader', 'Master', 'Navigator', 'Oracle', 'Pioneer', 'Quester',
    'Researcher', 'Strategist', 'Thinker', 'Visionary', 'Warrior', 'Expert', 'Champion', 'Wizard'
  ];
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 1000);
  
  return `${randomAdjective}${randomNoun}${randomNumber}`;
};

// Helper function to generate random avatar
const generateRandomAvatar = () => {
  const emojis = [
    '💻', '⚡', '🚀', '📊', '�', '📉', '�', '🔧', '⚙️', '🛠️', '🔬', '🧪', '📱', '💡',
    '🔍', '📋', '📌', '📎', '🔗', '�', '�', '📀', '🖥️', '⌨️', '🖱️', '📟', '☁️', '�',
    '🔐', '🔑', '🗝️', '�', '🧩', '�', '🕹️', '�', '📻', '⏰', '⏱️', '⏲️', '�', '🔌'
  ];
  
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)',
    'linear-gradient(135deg, #ffeef8 0%, #c7d2fe 100%)',
    'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    'linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)',
    'linear-gradient(135deg, #f4f4f4 0%, #e8e8e8 100%)',
    'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
    'linear-gradient(135deg, #48cae4 0%, #023e8a 100%)',
    'linear-gradient(135deg, #06ffa5 0%, #0080ff 100%)',
    'linear-gradient(135deg, #ff0084 0%, #33001b 100%)',
    'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
    'linear-gradient(135deg, #fdbb2d 0%, #22c1c3 100%)',
  ];
  
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
  const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
  
  return `${randomEmoji}|${randomGradient}`;
};

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    let profile = await UserProfile.findOne({ userId });
    
    // If profile doesn't exist, create one with random avatar and nickname
    if (!profile) {
      profile = new UserProfile({
        userId,
        nickname: generateRandomNickname(),
        avatar: generateRandomAvatar(),
        email: req.query.email || '',
      });
      
      profile.calculateCompleteness();
      await profile.save();
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user profile', 
      details: error.message 
    });
  }
});

// Update user profile
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    
    // Validate required fields
    if (updateData.nickname && updateData.nickname.trim().length === 0) {
      return res.status(400).json({ error: 'Nickname cannot be empty' });
    }
    
    // Check if nickname is already taken (excluding current user)
    if (updateData.nickname) {
      const existingProfile = await UserProfile.findOne({ 
        nickname: updateData.nickname, 
        userId: { $ne: userId } 
      });
      
      if (existingProfile) {
        return res.status(400).json({ error: 'Nickname is already taken' });
      }
    }
    
    // Update last active timestamp
    updateData.lastActive = new Date();
    
    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    // Recalculate profile completeness
    profile.calculateCompleteness();
    await profile.save();
    
    res.json(profile);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ 
      error: 'Failed to update user profile', 
      details: error.message 
    });
  }
});

// Check nickname availability
router.post('/check-nickname', async (req, res) => {
  try {
    const { nickname, userId } = req.body;
    
    if (!nickname || nickname.trim().length === 0) {
      return res.status(400).json({ error: 'Nickname is required' });
    }
    
    const existingProfile = await UserProfile.findOne({ 
      nickname: nickname.trim(), 
      userId: { $ne: userId } 
    });
    
    const isAvailable = !existingProfile;
    
    res.json({ 
      available: isAvailable,
      nickname: nickname.trim(),
      message: isAvailable ? 'Nickname is available' : 'Nickname is already taken'
    });
  } catch (error) {
    console.error('Error checking nickname availability:', error);
    res.status(500).json({ 
      error: 'Failed to check nickname availability', 
      details: error.message 
    });
  }
});

// Get random avatar
router.get('/avatar/random', (req, res) => {
  try {
    const randomAvatar = generateRandomAvatar();
    res.json({ avatar: randomAvatar });
  } catch (error) {
    console.error('Error generating random avatar:', error);
    res.status(500).json({ 
      error: 'Failed to generate random avatar', 
      details: error.message 
    });
  }
});

// Get random nickname
router.get('/nickname/random', async (req, res) => {
  try {
    let nickname;
    let isUnique = false;
    let attempts = 0;
    
    // Try to generate a unique nickname
    while (!isUnique && attempts < 10) {
      nickname = generateRandomNickname();
      const existingProfile = await UserProfile.findOne({ nickname });
      isUnique = !existingProfile;
      attempts++;
    }
    
    // If still not unique, add timestamp
    if (!isUnique) {
      nickname = `${nickname}_${Date.now()}`;
    }
    
    res.json({ nickname });
  } catch (error) {
    console.error('Error generating random nickname:', error);
    res.status(500).json({ 
      error: 'Failed to generate random nickname', 
      details: error.message 
    });
  }
});

// Get all available avatars
router.get('/avatars/all', (req, res) => {
  try {
    const emojis = [
      '💻', '⚡', '🚀', '📊', '�', '📉', '�', '🔧', '⚙️', '🛠️', '🔬', '🧪', '📱', '💡',
      '🔍', '📋', '📌', '📎', '🔗', '�', '�', '📀', '🖥️', '⌨️', '🖱️', '📟', '☁️', '�',
      '🔐', '🔑', '🗝️', '�', '🧩', '�', '🕹️', '�', '📻', '⏰', '⏱️', '⏲️', '�', '🔌'
    ];
    
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)',
      'linear-gradient(135deg, #ffeef8 0%, #c7d2fe 100%)',
      'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
      'linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)',
      'linear-gradient(135deg, #f4f4f4 0%, #e8e8e8 100%)',
      'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
      'linear-gradient(135deg, #48cae4 0%, #023e8a 100%)',
      'linear-gradient(135deg, #06ffa5 0%, #0080ff 100%)',
      'linear-gradient(135deg, #ff0084 0%, #33001b 100%)',
      'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
      'linear-gradient(135deg, #fdbb2d 0%, #22c1c3 100%)',
    ];
    
    const avatars = [];
    
    // Generate all combinations
    emojis.forEach(emoji => {
      gradients.forEach(gradient => {
        avatars.push(`${emoji}|${gradient}`);
      });
    });
    
    res.json({ avatars });
  } catch (error) {
    console.error('Error fetching avatars:', error);
    res.status(500).json({ 
      error: 'Failed to fetch avatars', 
      details: error.message 
    });
  }
});

// Delete user profile
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const profile = await UserProfile.findOneAndDelete({ userId });
    
    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    res.json({ message: 'User profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting user profile:', error);
    res.status(500).json({ 
      error: 'Failed to delete user profile', 
      details: error.message 
    });
  }
});

module.exports = router;
