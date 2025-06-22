const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 8000;
const distPath = path.join(__dirname, 'dist');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  let filePath = path.join(distPath, req.url === '/' ? 'index.html' : req.url);
  
  // Security check
  if (!filePath.startsWith(distPath)) {
    res.writeHead(403);
    res.end('Access denied');
    return;
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // Serve index.html for SPA routing
        fs.readFile(path.join(distPath, 'index.html'), (error, content) => {
          if (error) {
            res.writeHead(500);
            res.end('Server error: ' + error.code);
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        res.writeHead(500);
        res.end('Server error: ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(port, 'localhost', () => {
  console.log(`🎉 Frontend server running at http://localhost:${port}`);
  console.log(`📁 Serving files from: ${distPath}`);
  console.log(`🔗 Open in browser: http://localhost:${port}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ Port ${port} is busy, trying port ${port + 1}...`);
    server.listen(port + 1, 'localhost');
  } else {
    console.error('Server error:', err);
  }
});