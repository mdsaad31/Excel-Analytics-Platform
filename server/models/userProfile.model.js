const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userProfileSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  // Profile Information
  nickname: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
  avatar: {
    type: String,
    required: true,
    default: '💻|linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  bio: {
    type: String,
    trim: true,
    maxLength: 500,
    default: '',
  },
  
  // Contact and Work Information
  email: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  jobTitle: {
    type: String,
    trim: true,
    maxLength: 100,
    default: '',
  },
  company: {
    type: String,
    trim: true,
    maxLength: 100,
    default: '',
  },
  department: {
    type: String,
    trim: true,
    maxLength: 100,
    default: '',
  },
  location: {
    type: String,
    trim: true,
    maxLength: 100,
    default: '',
  },
  
  // Social Links
  socialLinks: {
    twitter: {
      type: String,
      trim: true,
      default: '',
    },
    linkedin: {
      type: String,
      trim: true,
      default: '',
    },
    github: {
      type: String,
      trim: true,
      default: '',
    },
    facebook: {
      type: String,
      trim: true,
      default: '',
    },
    instagram: {
      type: String,
      trim: true,
      default: '',
    },
    youtube: {
      type: String,
      trim: true,
      default: '',
    },
    tiktok: {
      type: String,
      trim: true,
      default: '',
    },
    discord: {
      type: String,
      trim: true,
      default: '',
    },
    reddit: {
      type: String,
      trim: true,
      default: '',
    },
    telegram: {
      type: String,
      trim: true,
      default: '',
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    other: {
      type: String,
      trim: true,
      default: '',
    },
  },
  
  // Skills
  skills: [{
    type: String,
    trim: true,
    maxLength: 50,
  }],
  
  // Preferences
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'light',
    },
    language: {
      type: String,
      default: 'en',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    dateFormat: {
      type: String,
      enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
      default: 'DD/MM/YYYY',
    },
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
      marketing: {
        type: Boolean,
        default: false,
      },
      updates: {
        type: Boolean,
        default: true,
      },
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private', 'friends'],
        default: 'private',
      },
      showEmail: {
        type: Boolean,
        default: false,
      },
      showOnlineStatus: {
        type: Boolean,
        default: true,
      },
    },
    dashboard: {
      defaultView: {
        type: String,
        enum: ['grid', 'list'],
        default: 'grid',
      },
      chartsPerPage: {
        type: Number,
        default: 12,
        min: 6,
        max: 50,
      },
      autoSaveCharts: {
        type: Boolean,
        default: true,
      },
      showTutorials: {
        type: Boolean,
        default: true,
      },
    },
  },
  
  // Metadata
  isVerified: {
    type: Boolean,
    default: false,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  profileCompleteness: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for full name
userProfileSchema.virtual('fullName').get(function() {
  return this.nickname || this.email?.split('@')[0] || 'User';
});

// Method to calculate profile completeness
userProfileSchema.methods.calculateCompleteness = function() {
  let score = 0;
  const weights = {
    nickname: 10,
    avatar: 10,
    bio: 15,
    phone: 5,
    jobTitle: 10,
    company: 10,
    department: 5,
    location: 10,
    socialLinks: 15,
    preferences: 10,
  };

  if (this.nickname) score += weights.nickname;
  if (this.avatar) score += weights.avatar;
  if (this.bio) score += weights.bio;
  if (this.phone) score += weights.phone;
  if (this.jobTitle) score += weights.jobTitle;
  if (this.company) score += weights.company;
  if (this.department) score += weights.department;
  if (this.location) score += weights.location;
  
  // Check if any social link is filled
  const socialCount = Object.values(this.socialLinks).filter(link => link).length;
  if (socialCount > 0) score += weights.socialLinks;
  
  // Preferences are always there with defaults
  score += weights.preferences;
  
  this.profileCompleteness = Math.min(score, 100);
  return this.profileCompleteness;
};

// Index for faster queries
userProfileSchema.index({ userId: 1 });
userProfileSchema.index({ nickname: 1 });
userProfileSchema.index({ email: 1 });

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

module.exports = UserProfile;
