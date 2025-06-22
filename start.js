#!/usr/bin/env node
import { spawn } from 'child_process';
import path from 'path';

console.log('🚀 Starting English Checkpoint servers...');

// Start backend server
const backend = spawn('npm', ['run', 'server:dev'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: '3002' }
});

// Wait 3 seconds then start frontend
setTimeout(() => {
  const frontend = spawn('npm', ['run', 'client:dev'], {
    stdio: 'inherit'
  });
  
  frontend.on('close', (code) => {
    console.log(`Frontend exited with code ${code}`);
    backend.kill();
    process.exit(code);
  });
}, 3000);

backend.on('close', (code) => {
  console.log(`Backend exited with code ${code}`);
  process.exit(code);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  backend.kill();
  process.exit(0);
});