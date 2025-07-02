const { spawn } = require('child_process');
const path = require('path');

console.log('🔧 Testing build process...');

const clientDir = path.join(__dirname, 'client');
const buildProcess = spawn('npm', ['run', 'build'], {
  cwd: clientDir,
  stdio: 'inherit'
});

buildProcess.on('error', (error) => {
  console.error('❌ Build process error:', error);
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Build completed successfully!');
  } else {
    console.error('❌ Build failed with exit code:', code);
  }
});