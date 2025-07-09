// Test file for file size validation and duplicate detection
// This file can be used to test the new features

export const testFileSize = (fileSize) => {
  const MAX_SIZE = 1024 * 1024; // 1MB
  return {
    isValid: fileSize <= MAX_SIZE,
    sizeInMB: (fileSize / (1024 * 1024)).toFixed(2),
    message: fileSize > MAX_SIZE ? 
      `File size (${(fileSize / (1024 * 1024)).toFixed(2)}MB) exceeds 1MB limit` :
      `File size (${(fileSize / (1024 * 1024)).toFixed(2)}MB) is within limits`
  };
};

export const generateMockFileHash = (fileName, fileSize) => {
  // Simple mock hash for testing
  return `mock-${fileName}-${fileSize}`;
};

// Test cases
console.log('Testing file size validation:');
console.log('Small file (500KB):', testFileSize(500 * 1024));
console.log('Large file (2MB):', testFileSize(2 * 1024 * 1024));
console.log('Exactly 1MB:', testFileSize(1024 * 1024));
