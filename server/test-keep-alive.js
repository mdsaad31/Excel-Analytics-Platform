const keepAliveService = require('./utils/keepAlive');
const cronJobService = require('./utils/cronJobs');

async function testKeepAlive() {
  console.log('🧪 Testing Keep-Alive Service...\n');
  
  // Test keep-alive service
  console.log('1. Testing Keep-Alive Service:');
  console.log('   Status before start:', keepAliveService.getStatus());
  
  keepAliveService.start();
  
  console.log('   Status after start:', keepAliveService.getStatus());
  
  // Wait 5 seconds
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  keepAliveService.stop();
  console.log('   Status after stop:', keepAliveService.getStatus());
  
  console.log('\n2. Testing Cron Job Service:');
  console.log('   Status before start:', cronJobService.getStatus());
  
  cronJobService.start();
  
  console.log('   Status after start:', cronJobService.getStatus());
  
  // Wait 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  cronJobService.stop();
  console.log('   Status after stop:', cronJobService.getStatus());
  
  console.log('\n✅ Keep-Alive tests completed!');
  console.log('\n📝 Next steps:');
  console.log('   1. Deploy to Render');
  console.log('   2. Set RENDER_EXTERNAL_URL environment variable');
  console.log('   3. Set up external monitoring (UptimeRobot, etc.)');
  console.log('   4. Add SERVER_URL secret to GitHub repository');
  console.log('   5. Enable GitHub Actions workflow');
}

// Run the test
testKeepAlive().catch(console.error);
