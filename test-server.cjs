const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  let filePath = req.url === '/' ? '/dist/index.html' : req.url;
  
  if (filePath.startsWith('/assets/')) {
    filePath = '/dist' + filePath;
  } else if (filePath !== '/dist/index.html') {
    filePath = '/dist/index.html';
  }
  
  const fullPath = path.join(__dirname, filePath);
  
  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end(`
        <html>
          <body>
            <h1>English Checkpoint Test</h1>
            <p>File not found: ${filePath}</p>
            <p>Testing server on port 5000</p>
            <p>Directory: ${__dirname}</p>
          </body>
        </html>
      `);
      return;
    }
    
    const ext = path.extname(fullPath);
    let contentType = 'text/html';
    
    if (ext === '.js') contentType = 'application/javascript';
    else if (ext === '.css') contentType = 'text/css';
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(5000, () => {
  console.log('✅ TEST SERVER RUNNING:');
  console.log('   http://localhost:5000');
  console.log('   http://127.0.0.1:5000');
  console.log('🚛 English Checkpoint ready!');
});